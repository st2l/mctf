from enum import Enum
import mongoengine as me
from bson import ObjectId
from mongoengine.base.datastructures import DBRef 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class UserStatus(Enum):
    ACTIVE = 0
    INACIVE = 1
    BLOCKED = 2


class User(me.Document):
    username = me.StringField(required=True, unique=True, max_length=50)
    password_hash = me.StringField(required=True)
    status = me.EnumField(UserStatus, required=True, default=UserStatus.ACTIVE)
    
    meta = {
        'collection': 'users',
        'indexes': ['username', 'status'],
        "allow_inheritance": True        
    }
    
    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256:1000')
    
    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)    

    def to_json(self):
        return {
            'id': str(self.id),
            'username': self.username
        }


class Partner(User):
    pass

class Buyer(User):
    cashback_amount = me.IntField(default=0)


class RetailRewardTypes(Enum):
    FIX = "FIX"
    PERCENT = "PERCENT"


class InternalDocument(me.Document):
    title = me.StringField(required=True)
    filename = me.StringField(required=True)
    content = me.StringField(required=True)
    user = me.LazyReferenceField(Partner, required=True, reverse_delete_rule=me.CASCADE)
    created_at = me.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'docs',
        'indexes': ['title', 'filename', 'created_at'],
    }

    def to_json(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'filename': self.filename,
            'content': self.content
        }

class RetailStore(me.Document):
    name = me.StringField(required=True)
    address = me.StringField(required=True)
    inn = me.StringField(required=True)
    user = me.LazyReferenceField(Partner, required=True, reverse_delete_rule=me.CASCADE)
    reward_type = me.EnumField(RetailRewardTypes, requited=True)
    reward_rate = me.IntField(required=True)
    created_at = me.DateTimeField(default=datetime.utcnow)
    approved = me.BooleanField(default=False)

    meta = {
        'collection': 'stores',
        'indexes': ['inn', 'user', 'approved', 'created_at'],
    }

    def to_json(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'inn': self.inn,
            'address': self.address,
            'reward_type': self.reward_type.value,
            'reward_rate': self.reward_rate,
            'approved': self.approved
        }


class ReceiptItem(me.EmbeddedDocument):
    sum = me.IntField(requred=True)
    name = me.StringField(required=True)
    price = me.FloatField(required=True)
    quantity = me.IntField(required=True)

    def to_json(self):
        return {
            'sum': self.sum,
            'name': self.name,
            'price': self.price,
            'quantity': self.quantity
        }


class Receipt(me.EmbeddedDocument):
    datetime = me.DateTimeField(required=True)
    items = me.EmbeddedDocumentListField(ReceiptItem)
    retail_store = me.ReferenceField(RetailStore, required=True)

    def to_json(self):
        return {
            'store': {
                'id': str(self.retail_store.id),
                'name': self.retail_store.name,
                'address': self.retail_store.address,
                'inn': self.retail_store.inn
            },
            'datetime': self.datetime,
            'items': [x.to_json() for x in self.items]
        }


class OperationTypes(Enum):
    INCOME = 1
    RET_INCOME = 2
    EXPENSE = 3
    RET_EXPENSE = 4


class QRStatus(Enum):
    INPROGRESS = 0
    COMPLETE = 1
    FAILED = 2


class QR(me.DynamicDocument):
    t = me.DateTimeField(required=True) # time
    s = me.FloatField(required=True) # summ
    fn = me.IntField(required=True) # FN
    i = me.IntField(required=True) # FD
    fp = me.IntField(required=True) # FPD
    n = me.EnumField(OperationTypes, required=True) # type of operation    
    
    user = me.LazyReferenceField(User, required=True, reverse_delete_rule=me.CASCADE)
    status = me.EnumField(QRStatus, required=True)
    receipt = me.EmbeddedDocumentField(Receipt)
    cashback_amount = me.IntField(default=0)

    meta = {
        'collection': 'qrs',
        'indexes': ['inn', 'user'],
    }

    def to_json(self):
        fields = {}
        for field in self._fields_ordered:
            value = getattr(self, field)
            if isinstance(value, ObjectId):
                value = str(value)
            elif isinstance(value, Enum):
                value = value.value
            elif isinstance(value, DBRef):
                value = str(value.id)
            elif isinstance(value, me.document.BaseDocument):
                value = value.to_json()
            fields[field] = value
        return fields
    