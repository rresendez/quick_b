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

CREATE TABLE `tbl_log_csv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `username` varchar(45) NOT NULL,
  `create_entry` int(11) NOT NULL DEFAULT '0',
  `del_non_4` int(11) NOT NULL DEFAULT '0',
  `time_non_match` int(11) NOT NULL DEFAULT '0',
  `time_match` int(11) NOT NULL DEFAULT '0',
  `db_orphan` int(11) NOT NULL DEFAULT '0',
  `state_update` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
