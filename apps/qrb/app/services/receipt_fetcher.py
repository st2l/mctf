from datetime import datetime
from ..models import QRStatus, QR, RetailStore, ReceiptItem, Receipt

# emulate remote service respose 
def _mock():
    import random
    from dataclasses import dataclass

    ITEM_NAMES = ['BULOCHKA', 'THE SUMKA', 'STUL FOR FOUR PEOPLE', 'TICKET', 'HEADPHONES', 'NOTEBOOK', 'CLOTHES']

    @dataclass
    class Response:
        body: dict
        status: int = 200
    
    def gen_item():
        price = random.randint(256, 65535) * 100
        quantity = random.randint(1, 5)
        return {
            "sum": price * quantity, 
            "name": random.choice(ITEM_NAMES), 
            "price": price,
            "quantity": quantity
        }

    def response(qr: QR):
        if qr.t > datetime.now():
            return Response({'msg': 'Invalid Datetime'}, 400)

        stores = list(RetailStore.objects(approved=True).aggregate([{"$sample": {"size": 1}}]))
        if len(stores) == 0:
            return Response({'msg': 'No stores'}, 404)
        
        store = stores[0]
        return Response({
            'user': store['name'],
            'dateTime': qr.t.strftime('%Y-%m-%dT%H:%M:%S'),
            'items': [gen_item() for _ in range(random.randint(1, 3))],
            'userInn': store['inn'],
            'retailPlaceAddress': store['address']
        })
    return response


_mock_response = _mock()

def get_reciept(qr: QR):
    response = do_request(qr)
    return Receipt(
        datetime = response['dateTime'], 
        items = [ReceiptItem(**x) for x in response['items']],
        retail_store = RetailStore.objects(inn=response['userInn']).first(),
    )

def do_request(qr: QR):
    r = _mock_response(qr)
    if r.status != 200:
        raise RuntimeError(r.body['msg'])
    return r.body
