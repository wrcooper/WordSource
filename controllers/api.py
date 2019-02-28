import os, subprocess

def get_user():
  if auth is not None:
    return response.json(
      dict(user_id = auth.user_id)
    )
  else:
    return response.json(
      dict(user_id = -1)
    )

def get_wordsources():
  wordsources = db(db.wordsources.source_owner == request.vars.user_id).select()
  return response.json(
    dict(wordsources = wordsources)
  )
  
def delete_wordsource():
  db(db.wordsources.id == request.vars.wordsource_id).delete()
  return

def select_wordsource():
  wordsource = db(db.wordsources.id == request.vars.wordsource_id).select() 
  return response.json(
    dict(wordsource = wordsource)
  )
  
def process_wordsource():
  wordsource_arr = db(db.wordsources.id == request.vars.wordsource_id).select() 
  wordsource = wordsource_arr[0]
  filename, file_extension = os.path.splitext(wordsource.origin)
  if (file_extension == ".pdf"):
    print("PDF")
    #print subprocess.check_output(['ls','-l'])
    #subprocess.run(["pdf2txt.py " + wordsource.origin + " > "])
  return