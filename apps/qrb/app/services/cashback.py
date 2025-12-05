from ..models import QR, Receipt, RetailRewardTypes

def calculate(receipt: Receipt):
    store = receipt.retail_store
    reward = 0
    for item in receipt.items:
        if store.reward_type == RetailRewardTypes.FIX:
            reward += store.reward_rate
        elif store.reward_type == RetailRewardTypes.PERCENT:
            reward += int(item.sum / 10000) * store.reward_rate
    return reward

def reward(receipt: Receipt, qr: QR):
    reward = calculate(receipt)
    qr.modify(cashback_amount=reward)
    buyer = qr.user.fetch()
    buyer.update(inc__cashback_amount=reward)