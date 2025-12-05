from ..config import QUEUE_DISPATCHER

_dispatcher = QUEUE_DISPATCHER()

def dispatch(func, *args, **kwargs):
    _dispatcher.dispatch(func, *args, **kwargs)
