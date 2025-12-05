from base64 import b64decode, b64encode 
import hmac
import hashlib
import jwt
from flask import session, g
from functools import wraps
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound
from ..config import PUBLIC_KEY, SECRET_KEY
from ..models import User, UserStatus


def challenge_generate(code: str):
    h = hmac.new(SECRET_KEY.encode(), code.encode(), hashlib.md5)
    return h.digest()


def challenge_valid(token: str):
    try:
        decoded = jwt.decode(token, PUBLIC_KEY, algorithms=['RS256'])
        computed_h = challenge_generate(decoded['code'])
        return hmac.compare_digest(
            computed_h, 
            b64decode(decoded['challenge_response'].encode())
        )
    except jwt.ExpiredSignatureError:
        Unauthorized('JWT has exired')
    except Exception as e:
        Unauthorized(str(e))


def challenge(code):
    return b64encode(challenge_generate(code)).decode()


"""
    !!!THE METHOD IS NOT PART OF THE TASK, IT IS USED ONLY BY CHECKER!!!
"""
def register_with_challenge(cls: type[User], username: str, password: str, challenge_token: str):
    if not challenge_valid(challenge_token):
        raise Unauthorized('Invalid challenge')
    return register(cls, username, password)


def register(cls: type[User], username: str, password: str):
    if not username or not password :
        raise BadRequest('Username, email and password are required')
    
    if cls.objects(username=username).first():
        raise BadRequest('Username already exists')

    user = cls(username=username)
    user.set_password(password)
    user.save()
    return user


def login(cls: type[User], username: str, password: str):
    user = cls.objects(username=username).first()    
    if user and user.check_password(password):
        session['username'] = user.username
        return user
    raise Unauthorized('Invalid credentials')


def logout():
    session.clear()


def middleware(cls: type[User] = User):
    def load_user(username: str):
        try:
            return cls.objects.get(username=username)
        except cls.DoesNotExist:
            raise NotFound('User not found')
    
    def decorated():
        username = session.get('username')
        user = load_user(username) if username else None
        if not user or not isinstance(user, cls):
            raise Unauthorized('Authorization Required')
        g.user = user
    return decorated


def is_authenticated(cls: type[User] = User):
    def auth_decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            func = middleware(cls)
            func()
            return f(*args, **kwargs)
        return decorated
    return auth_decorator
