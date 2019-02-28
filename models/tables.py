db.define_table('wordsources',
	Field('name', requires=IS_NOT_EMPTY()),
	Field('origin', 'upload', requires=IS_NOT_EMPTY()),
	Field('filetype', 'text'),
	Field('source_owner', 'text')
)