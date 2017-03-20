/**
 * Created by barrett on 8/28/14.
 */

var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);



connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.log_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `date` VARCHAR(60) NOT NULL, \
    `username` VARCHAR(20) NOT NULL, \
    `rows_affected` int NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `date_UNIQUE` (`date` ASC) \
)');

console.log('Success: table Created!');

connection.end();
