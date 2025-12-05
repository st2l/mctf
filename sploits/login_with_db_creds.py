#!/usr/bin/env python3
"""
Take the latest account from DB (with stored password) and try to log in to the service.

Config: edit DB_* and SERVICE_* below.
"""
import socket

import psycopg

# --- CONFIG ---
DB_HOST = "127.0.0.1"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASS = "cowwithballs"
DB_NAME = "arasaka_academy"
DB_TABLE = "students"  # "students" or "professors"

SERVICE_HOST = "127.0.0.1"  # service host
SERVICE_PORT = 1337         # service port
CONNECT_TIMEOUT = 5
# ---------------


def fetch_last_creds():
    with psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT name, pass FROM {DB_TABLE} ORDER BY id DESC LIMIT 1;")
            row = cur.fetchone()
            if not row:
                return None, None
            return row[0], row[1]


def recv_until(sock: socket.socket, marker: bytes, timeout: float = CONNECT_TIMEOUT) -> bytes:
    sock.settimeout(timeout)
    data = b""
    while marker not in data:
        chunk = sock.recv(4096)
        if not chunk:
            break
        data += chunk
    return data


def try_login(username: str, password: str, as_prof: bool) -> tuple[bool, bytes]:
    s = socket.create_connection((SERVICE_HOST, SERVICE_PORT), timeout=CONNECT_TIMEOUT)
    recv_until(s, b"Choose:")
    s.sendall(b"1\n")  # Login
    recv_until(s, b"Login as:")
    s.sendall(b"2\n" if as_prof else b"1\n")
    recv_until(s, b"Enter username:")
    s.sendall((username + "\n").encode())
    recv_until(s, b"Enter password:")
    s.sendall((password + "\n").encode())
    banner = recv_until(s, b"Choose:", timeout=3)
    s.close()
    ok = b"Student" in banner or b"Professor" in banner or b"Get info" in banner
    return ok, banner


def main():
    username, password = fetch_last_creds()
    if not username:
        print("[!] No accounts found")
        return
    print(f"[+] Trying login for {username} from {DB_TABLE}")
    ok, banner = try_login(username, password, as_prof=(DB_TABLE == "professors"))
    status = "OK" if ok else "FAIL"
    print(f"[{status}] {username} / {password}")
    for line in banner.decode(errors="ignore").splitlines()[:5]:
        print("  ", line)


if __name__ == "__main__":
    main()
