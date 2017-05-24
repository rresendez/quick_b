// config/database.js
module.exports = {
    'connection': {
        'host': "192.168.10.15",
        'user': 'practez_modules',
        'password': 'IngPss2015$@',
        'database': 'test_db_BETA02',
        'connectionLimit':20000,
        'connectTimeout':100000,
        'poolSize':10000,
        'queueLimit':1000
    },
	'database': 'test_db_BETA02',
    'users_table': 'tbl_users_servs',
    'log_table': 'logs'

};
