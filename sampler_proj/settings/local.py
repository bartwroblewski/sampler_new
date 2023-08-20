from .base import *

DEBUG = True

# should be empty, providing IP just to allow running in dev mode on Digital Ocean
ALLOWED_HOSTS = ['*']

MEDIA_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'media')
