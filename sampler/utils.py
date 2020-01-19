import os
from zipfile import ZipFile
from io import BytesIO

def zip_files(filepaths):
    mem_file = BytesIO()
    with ZipFile(mem_file, 'w') as z:
        for f in filepaths:
            basename = os.path.basename(f)
            print(basename)
            z.write(f, basename)
    return mem_file
