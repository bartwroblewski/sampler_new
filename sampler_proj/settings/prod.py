import os

from .base import *

DEBUG = False

ALLOWED_HOSTS = ['134.209.236.65']

STATIC_ROOT = os.path.join(
    os.path.dirname(BASE_DIR),
    'collected_static',
)
