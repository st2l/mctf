import os.path
import uuid
import logging
from logging.handlers import RotatingFileHandler
from urllib.parse import parse_qsl
from pyzbar import pyzbar
from PIL import Image
from werkzeug.datastructures import FileStorage
from ..config import QR_UPLOAD_FOLDER
from ..models import User, QR, QRStatus, OperationTypes
from . import receipt_fetcher as rf
from . import cashback


def upload(file: FileStorage):
    _, ext = os.path.splitext(file.filename)
    if ext not in ('.png', '.jpg', '.jpeg'):
        raise ValueError(f'Invalid extension: {ext}')

    if not os.path.exists(QR_UPLOAD_FOLDER):
        os.mkdir(QR_UPLOAD_FOLDER)

    filename = os.path.join(QR_UPLOAD_FOLDER, str(uuid.uuid4()) + ext)
    file.save(filename)
    return filename


def parse_qr(qr_id: str, filename: str, user: User):
    def _prepare_data(qr_content):
        data = dict(parse_qsl(qr_content))
        if 'n' in data:
            data['n'] = OperationTypes(int(data['n']))
        return data

    try:
        img = Image.open(filename)
        decoded = pyzbar.decode(img, symbols=[pyzbar.ZBarSymbol.QRCODE])
        if not decoded or len(decoded) == 0:
            raise ValueError('Invalid QR')
        data = _prepare_data(decoded[0].data.decode())
        
        if qr_id is None: 
            qr = QR(user=user, status=QRStatus.INPROGRESS.value, **data)
            qr.save()
        else:
            qr = QR.objects(id=qr_id, status=QRStatus.FAILED.value).get()
            qr.modify(status=QRStatus.INPROGRESS.value, **data)
        return qr
    except QR.DoesNotExist:
        raise e
    except Exception as e:
        if 'qr' in locals():
            qr.modify(status=QRStatus.FAILED.value)
        raise e
    finally:
        if os.path.exists(filename):
            os.unlink(filename)


def process_logger():
    logger = logging.getLogger('process_qr')
    handler = RotatingFileHandler('process_qr.log', maxBytes=1024 * 10)
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s:'))
    logger.addHandler(handler)
    return logger


_process_logger = process_logger()

def process_qr(qr_id: str):
    try:
        qr = QR.objects(id=qr_id).get()
        receipt = rf.get_reciept(qr)
        cashback.reward(receipt, qr)

        qr.modify(receipt=receipt, status=QRStatus.COMPLETE.value)
    except Exception as e:
        qr.modify(status=QRStatus.FAILED.value)
        _process_logger.error("QR process filed", exc_info=True)
