import os

from .base import *

DEBUG = False

ALLOWED_HOSTS = ['134.209.236.65']

STATIC_ROOT = os.path.join(
    os.path.dirname(BASE_DIR),
    'collected_static',

)

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/home/sampler/logs/gunicorn.errors',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
