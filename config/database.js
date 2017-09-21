// config/database.js
module.exports = {
    'connection': {
        'host': "localhost",
        'user': 'root',
        'password': 'Rodriguez24',
        'database': 'local_auth',
        'connectionLimit':20000,
        'connectTimeout':100000,
        'acquireTimeout':100000,
        'poolSize':10000,
        'queueLimit':1000
    },
	'database': 'local_auth',
    'users_table': 'users',
    'log_table': 'logs'

};
