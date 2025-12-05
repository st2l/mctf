from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException, BadRequest
from mongoengine import connect, ValidationError, NotUniqueError
from .models import RetailStore, RetailRewardTypes, Partner
from .config import MONGODB_CONFIG, SECRET_KEY, DEFAULT_PARTNER_PASSWORD, MAX_CONTENT_LENGTH
from .routes.auth import auth_bp
from .routes.buyer import buyer_bp
from .routes.partner import partner_bp

def handle_exception(e: Exception):
    if isinstance(e, ValidationError):
        e = BadRequest(str(e))

    if not isinstance(e, HTTPException):
        raise RuntimeError('Unhandled exception') from e

    return jsonify({
        "error": e.name,
        "description": e.description
    }), e.code


def create_default_partner():
    partner = Partner.objects(username='default').first()
    if not partner:
        try:
            partner = Partner(username='default')
            partner.set_password(DEFAULT_PARTNER_PASSWORD)
            partner.save()

            default_store = RetailStore(
                name='default',
                address='our address',
                inn="123456789123",
                user=partner,
                reward_type=RetailRewardTypes.FIX,
                reward_rate=1,
                approved=True
            )
            default_store.save()
        except NotUniqueError:
            pass


def create_app():
    connect(**MONGODB_CONFIG)

    create_default_partner()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    app.register_blueprint(auth_bp)
    app.register_blueprint(buyer_bp)
    app.register_blueprint(partner_bp)
    app.register_error_handler(Exception, handle_exception)
    return app