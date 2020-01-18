import shutil
import os

def zip(files, target_folder):
	files_folder = os.path.join(sampler_settings.AUDIO_PATH, session_key, 'serve') 
	zip_folder = os.path.join(sampler_settings.AUDIO_PATH, session_key, 'zip')
	zip_path = os.path.join(zip_folder, 'samples')
	
	shutil.make_archive(zip_path, 'zip', root_dir=files_folder)
	
	zipfile = open(os.path.join(zip_folder, 'samples.zip'), 'rb')
	return zipfile
