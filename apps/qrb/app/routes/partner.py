from base64 import b64encode 
from jsonpath import jsonpath
import dateutil 
from flask import Blueprint, request, g
from werkzeug.exceptions import BadRequest, InternalServerError
from ..models import Partner, RetailStore, InternalDocument
from ..services.auth import middleware
from ..services import receipt_fetcher as rf
from ..services import qr as qr_service


partner_bp = Blueprint('partner', __name__, url_prefix='/api/partner')
partner_bp.before_request(middleware(Partner))

@partner_bp.route('/stores', methods=['GET'])
def stores():
    return [x.to_json() for x in RetailStore.objects(user=g.user)]


@partner_bp.route('/store', methods=['POST'])
def add_store():
    data = request.get_json()
    store = RetailStore(user=g.user, **data)
    store.save()
    return store.to_json()


@partner_bp.route('/store/<store_id>', methods=['GET'])
def store(store_id: str):
    store = RetailStore.objects(id=store_id, user=g.user).get()
    return store.to_json()


@partner_bp.route('/store/<store_id>', methods=['PUT'])
def update(store_id: str):
    data = request.get_json()
    store = RetailStore.objects(id=store_id, user=g.user).get()
    store.modify(**data)
    return store.to_json()


@partner_bp.route('/internal_docs', methods=['GET'])
def internal_docs():
    return [x.to_json() for x in InternalDocument.objects(user=g.user)]


@partner_bp.route('/internal_doc/<doc_id>', methods=['GET'])
def get_doc(doc_id: str):
    doc = InternalDocument.objects(id=doc_id, user=g.user).get()
    return doc.to_json()


@partner_bp.route('/internal_doc', methods=['POST'])
def upload_doc():
    file = request.files.get('doc', None)
    if not file or not file.filename:
        raise BadRequest('"doc" field is required')

    doc = InternalDocument(
        title=request.form.get('title'),
        filename=file.filename,
        content=b64encode(file.read()),
        user=g.user
    )
    doc.save()
    return doc.to_json()


@partner_bp.route('/tools/check_qr', methods=['POST'])
def check_qr():
    file = request.files.get('qr', None)
    if not file or not file.filename:
        raise BadRequest('"qr" field is required')

    try:
        filename = qr_service.upload(file) 
        qr = qr_service.parse_qr(None, filename, g.user)
        qr.t = dateutil.parser.parse(qr.t)
        req = rf.do_request(qr)
        
        filter = request.form.get('filter')
        if not filter:
            return req
        req = jsonpath(req, filter)
        return req if req else {}        
    except Exception as e:
        raise InternalServerError(str(e)) from e