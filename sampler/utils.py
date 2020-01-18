#~ import shutil
#~ import os
from zipfile import ZipFile
from io import BytesIO

def zip_files(filepaths, folder):
	#~ files_folder = os.path.join(sampler_settings.AUDIO_PATH, session_key, 'serve') 
	#~ zip_folder = os.path.join(sampler_settings.AUDIO_PATH, session_key, 'zip')
	#~ zip_path = os.path.join(zip_folder, 'samples')
	#~ shutil.make_archive(zip_path, 'zip', root_dir=files_folder)
	
	#~ zipfile = open(os.path.join(zip_folder, 'samples.zip'), 'rb')
	#~ return zipfile
    
    
    #~ zip_filename = os.path.join(folder, 'samples.zip')
    
    # replace zip_filename with mem_file
    mem_file = BytesIO()
    with ZipFile(mem_file, 'w') as z:
        for f in filepaths:
            z.write(f)
    return z
