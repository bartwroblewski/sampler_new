#~ import shutil
#~ import os
from zipfile import ZipFile
from io import BytesIO

def zip_files(filepaths, folder):
    mem_file = BytesIO()
    with ZipFile(mem_file, 'w') as z:
        for f in filepaths:
            z.write(f)
    return mem_file
