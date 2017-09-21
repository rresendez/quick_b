module.exports = function(app, passport) {

	var express = require('express');
	var fs = require('fs-extra');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var dialog = require('dialog');
	var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/quick_b";
	//Varaible helps to indetify dates index for temp table


	var dbconfig = require('../config/database');
	var exports = module.exports={};




  //=======================================
  //FORM_PROCESS===========================
  //=======================================
  app.post('/sql',isLoggedIn, function(req, res){
		//Declare ids and dates
		var ids=[];
		var dates=[];
  //FILE_SYSTEM_CSV========================
  	//File location

	var stream = fs.createReadStream('./upload/test.csv');






  	//Opening CSV
  	  console.log("Retriving info from CSV");
  	//CSV fast-csv object setup

    //Create MySQL connection
  var i=0;
	var myobj = {};
	var longS="";

  	csv
  	  .fromStream(stream,{objectMode:true,delimiter:','})

  	// Validation


  	  .on("data", function(data){
				var str = JSON.stringify(data);
				var arr = str.split(",");
				var col;
				var ent="";
				arr = JSON.parse(arr);

					if(i==0) {
					longS='"Entity": '+'"'+arr[0]+'", ';
						}
					else if(i==2){
						longS=longS+'"Date": '+'"'+arr[0]+'", ';
					}
					else if(i>=6&&arr[1]){
						var string = arr[1].toString();
						arr[0]=arr[0].trim();
              if(string.includes("$")){
								console.log("Array found");
								arr[1]=arr[1].replace(/$/gi,'');

							}
							if(arr[1].includes(",")){
								arr[1]=arr[1].replace(/,/gi,'');

							}
						longS=longS+'"'+arr[0]+'": "'+arr[1]+'", ';
					}


				console.log("Line: "+ i+" AI1 > "+arr[0]+"AI2 > "+arr[1]);
				i++;
			})


  		.on("end", function(){
        console.log("CSV file closed");
				console.log(longS+"out");
				longS=longS.substring(0,longS.length - 2);
				longS=JSON.parse("{"+longS+"}");
				insert_quick_b(MongoClient,longS,url);

			});










  	//Retrive affected rows

  	//Create conection


  //MYSQL_CONNECTION_END=======================
  	res.render('sql_done');




})

}




	//Function Remove not 4 for option 1 and 3

	function remove_not (con,real_id,format_date,callback){
	  con.query('DELETE from tbl_consult WHERE id_patient=? AND date_consult=? AND id_state!=4 ',[real_id,format_date],function(err,result){
	    if(err) callback(err,null);
	      else {
	        callback(null,result);
	      }
	  })

	}
	// Function update wrong time for option 2
	function update_time (con,data_time,data_time_b,temp_id,callback){
		con.query('UPDATE tbl_consult SET start_consult=?, end_consult=? WHERE id=?',[data_time,data_time_b,temp_id],function(err,result){
			if(err) callback(err,null);
			else callback(null,result);

		})
	}
	//Function delete all other entries with wrong time for option 2
	function del_two (con,format_date,real_id,temp_id,callback){
		con.query('DELETE from tbl_consult WHERE date_consult=? AND id_patient=? AND id!=? AND id_state!=4',[format_date,real_id,temp_id],function(err,result){
			if(err) callback(err,null);
			else callback(null,result);
		})
	}
	function get_prov(con,prov_fname,prov_last,callback){
		con.query('SELECT id FROM tbl_user WHERE fristname_user=? AND lastname_user=?',[prov_fname,prov_last],function(err,id){
			if(err) callback(err,null);
			else callback(null,id);
		})
	}
	//Function to add new entry
	function add_new(con,format_date,data_time,real_id,id_provider,callback){
		con.query('CALL 00000_Create_APP_RECORD(?,?,?,?)',[format_date,data_time,real_id,id_provider],function(err,result){
			if(err) callback(err,null);
			else callback(null,result);
		})
	}
	//Function add log

	function create_log(con,req,callback){


		//date = date.toString();
		con.query('INSERT INTO tbl_log_csv (username,date) VALUES (?,NOW())',[req.user.username],function(err,result){
			if(err) callback(err,null);
			else{
				con.query("SELECT LAST_INSERT_ID() as last",function(err,res){
					if(err) callback(err,null);
					else{
						callback(null,res);
					}
				})
			}
		})
	}
	//Function add Patient
	function add_patient(con,data,callback){
		var name = data.c_pe_name.split(",");
		var dob = data.d_pe_dob.split(" ");
		dob = dob[0];
		dob= dob.split("/");
		dob= dob[2]+"-"+dob[0]+"-"+dob[1];
		con.query('INSERT INTO tbl_patient (numid_patient,firstname_patient,lastname_patient,gender_patient,datebirth_patient) VALUES(?,?,?,?,?)',[data.c_pe_patient_id,name[1][1],name[0][0],"M",dob],function(err,result){
			if(err) callback(err,null);
			else{
				get_new_id(con,data,function(err,result){
					if(err) callback(err,null);
					else{
						callback(null,result);
					}
				})
			}
		})
	}
	//Function update log
	function update_log(con,query,value,id,callback){
		//var mysql = require('mysql');
		//var dbconfig = require('../config/database');
		//var con = mysql.createConnection(dbconfig.connection);
		con.query(query,[value,id],function(err,result){
			if(err)callback(err,null);
			else{
				console.log("Log updated");
				callback(null,result);
			}
		})

	}
//Function disable foregin key
function foreign(con,callback){
	con.query("SET foreign_key_checks = 0",function(err,res){
		if(err){
			callback(err,null);

		}
		else{
			callback(null,res);
		}
	})
}
//Function to re-enable foregin key restrain
function foreignE(con,callback){
	con.query("SET foreign_key_checks = 1",function(err,res){
		if(err){
			callback(err,null);

		}
		else{
			callback(null,res);
		}
	})
}


//Error test box function

function pop_err(){
	var dialog = require('dialog');
	var fs = require('fs-extra');
	dialog.warn("There was an error!,\nPlease reference to console for more details.");
	var path="upload/test.csv";
	var pathB="upload/testb.csv"
	if(fs.existsSync(path)){
	fs.unlinkSync(path);

}
}
//Function get new id
function get_new_id (con,data,callback){
		con.query("SELECT id FROM tbl_patient WHERE numid_patient=? ",[data.c_pe_patient_id],function(err,res){
			if (err) callback(err,null);
			else{
				callback(null,res);
			}})


	}

	//Function

	function insert_quick_b(MongoClient,myobj,url){
		MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection("csv").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
		console.log(res);
    db.close();
  });
});


	}

//Function formart date_ind

function format_date_fn (data){
	//Split csv date into date and time
	var temp_data = data.t_ap_starttime.split(" ");

	//Check for missing 0 in date format
	if(temp_data[0][1]=="/"){
		temp_data[0]="0"+temp_data[0];
	}
	//Assing date to variable
	var data_date = temp_data[0];

	//Check for missing 0 in time format
	if(temp_data[1][1]==":"){
		temp_data[1]="0"+temp_data[1];
	}
	//Finish correcting wrong time format
	var data_time = temp_data[1]+":00";
	//Correct CSV date format
	var format_date=data_date.split("/");

 format_date= format_date[2]+"-"+format_date[0]+"-"+format_date[1];
 return format_date;
}
  // route middleware to make sure
  function isLoggedIn(req, res, next) {

  	// if user is authenticated in the session, carry on
  	if (req.isAuthenticated())
  		return next();

  	// if they aren't redirect them to the home page
  	res.redirect('/');
  }
