# a simple synchronized queue for emulating a task queue
class SyncDispatcher():
    def dispatch(self, func, *args, **kwargs):
        func(*args, **kwargs)