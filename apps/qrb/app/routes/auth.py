from flask import Blueprint, request, redirect, g
from enum import Enum
from werkzeug.exceptions import BadRequest
from ..models import User, Buyer, Partner
from ..services import auth 

class LoginModels(Enum):
    BUYER = Buyer
    PARTNER = Partner
    

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/partner/challenge', methods=['POST'])
def challenge():
    data = request.get_json()
    return {
        'challenge_response': auth.challenge(data['code'])
    }


@auth_bp.route('/partner/register', methods=['POST'])
def register_partner():
    data = request.get_json()
    user = auth.register_with_challenge(
        Partner, 
        data.get('username'), 
        data.get('password'),
        data.get('challenge_token')
    )
    return user.to_json()


@auth_bp.route('/buyer/register', methods=['POST'])
def register_buyer():
    data = request.get_json()
    user = auth.register(
        Buyer,
        data.get('username'), 
        data.get('password')
    )
    return user.to_json()


@auth_bp.route('/<model>/login', methods=['POST'])
def login(model: str):
    model = model.upper()
    if model not in LoginModels.__members__:
        raise BadRequest('Invalid login type')

    data = request.get_json()
    user = auth.login(LoginModels[model].value, data.get('username'), data.get('password'))
    return user.to_json()


@auth_bp.route('/logout', methods=['GET'])
@auth.is_authenticated(User)
def logout():
    auth.logout()
    return redirect('/')


@auth_bp.route('/me', methods=['GET'])
@auth.is_authenticated(User)
def me():
    return g.user.to_json()