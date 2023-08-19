import os

from .base import *

DEBUG = False

ALLOWED_HOSTS = ['46.101.156.79']

STATIC_ROOT = os.path.join(
    os.path.dirname(BASE_DIR),
    'collected_static',

)

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/home/sampler/logs/gunicorn.errors',
        },
    },
    'loggers': {
        'gunicorn.errors': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}