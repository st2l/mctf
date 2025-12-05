from flask import Blueprint, request, g
from werkzeug.exceptions import BadRequest, InternalServerError
from ..background_task import dispatcher 
from ..models import QR, QRStatus, Receipt, Buyer
from ..services import qr as qr_service
from ..services.auth import middleware 

buyer_bp = Blueprint('buyer', __name__, url_prefix='/api/buyer')
buyer_bp.before_request(middleware(Buyer))
    

@buyer_bp.route('/receipts', methods=['GET'])
def receipts():
    return [x.to_json() for x in QR.objects(user=g.user, status=QRStatus.COMPLETE).select_related()]


@buyer_bp.route('/failed_qrs', methods=['GET'])
def failed_qrs():
    return [str(x.id) for x in QR.objects(user=g.user, status=QRStatus.FAILED)]


@buyer_bp.route('/qr/<qr_id>', methods=['PUT'], endpoint='update_qr')
@buyer_bp.route('/qr', methods=['POST'], endpoint='upload_qr')
def upload_qr(qr_id: str = None):
    file = request.files.get('qr', None)
    if not file or not file.filename:
        raise BadRequest('"qr" field is required')
    
    try:
        filename = qr_service.upload(file)
        qr = qr_service.parse_qr(qr_id, filename, g.user)
        dispatcher.dispatch(qr_service.process_qr, qr.id)
    except Exception as e:
        raise InternalServerError(str(e)) from e
    return qr.to_json()


@buyer_bp.route('/qr/<qr_id>', methods=['GET'])
def qr(qr_id: str):
    qr = QR.objects(id=qr_id, user=g.user).get()
    return qr.to_json()