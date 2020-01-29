from django.core.management.base import BaseCommand
from django.conf import settings

from sampler.models import Sample

class Command(BaseCommand):
    def handle(self, *args, **options):
        threshold_in_hours = 12
        for sample in Sample.objects.all():
            sample.remove_if_old(threshold_in_hours)
