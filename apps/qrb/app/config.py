import os
from dotenv import load_dotenv
from .background_task.sync import SyncDispatcher

load_dotenv()

MONGODB_CONFIG = {
    'db': os.getenv('MONGODB_DB', 'qrb'),
    'host': os.getenv('MONGODB_HOST', 'localhost'),
    'port': int(os.getenv('MONGODB_PORT', 27017)),
    'username': os.getenv('MONGODB_USERNAME', 'admin'),
    'password': os.getenv('MONGODB_PASSWORD', 'password123'),
    'authentication_source': 'admin'
}

SECRET_KEY = os.getenv('SECRET_KEY')
DEFAULT_PARTNER_PASSWORD = os.getenv('DEFAULT_PARTNER_PASSWORD')
PUBLIC_KEY = b"""-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlfbEXxAoiw8ND0EoPkjmLatoy
dKc2yE/RTX3WtO8HxjDGc7pY3ivqEQ9/JQ6qxmolvwDKkKkdxhxw2zq0XxqTFq7O
AkCJW65MUwv8MZYt23ZJ4eyKiHtmYsipZKLj/jvZaJEKDByrJoWybzyzhpq7/WTx
Htfiea5at11Vdyr/FQIDAQAB
-----END PUBLIC KEY-----
"""
MAX_CONTENT_LENGTH = 1 * 1024 * 1024
QR_UPLOAD_FOLDER = os.getenv('QR_UPLOAD_FOLDER', '/app/qrs')
QUEUE_DISPATCHER = SyncDispatcher