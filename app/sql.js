module.exports = function(app, passport) {

	var express = require('express');
	var fs = require('fs');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var dialog = require('dialog');
	var date_ind=0;
	var ids_ind=0;
	var call =0;
	var csv_count =0;
	var log_id=0;
	var real_id=[];

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
    var con = mysql.createConnection(dbconfig.connection);
		//Create log
		var date = new Date();
		date =date.toLocaleDateString();
		var log_date=date.split("/");
		//Format date

		log_date= log_date[2]+"-"+log_date[0]+"-"+log_date[1];
		console.log("Lod date: "+log_date);
		//Create entry for log table
		create_log(con,req,log_date,function(err,result){
			if(err) {
				 console.error(err);
				 pop_err();

			 }
			else{
				console.log("Log created ");
				log_id=result[0].last;
				exports.log=log_id;
				con.end();

			}
		})


  	csv
  	  .fromStream(stream, {headers: true})

  	// Validation


  	  .on("data", function(data){





  //MYSQL_CONNECTION=======================

      //MySQL conneciton to db
  	if(data.c_pe_patient_id!=""){



      //Estabilishg connection

    /*  con.connect(function(err){
        if(err){
          console.log('Error conecting to MySQL');
          return;
        }
        console.log('Connection to MySQL established');
      });
			*/



  		console.log("Patient id: "+data.c_pe_patient_id);
  		con.query("SELECT * FROM tbl_patient WHERE numid_patient=?",[data.c_pe_patient_id], function(err,result){
  			if(err) {
					console.log(err);
					pop_err();
				}
				if(result.length==0){
					var con = mysql.createConnection(dbconfig.connection);
					add_patient(con,data,function(err,result){
						if(err){
							console.log(err);
							pop_err();
						}
						else{
							console.log("New patient created");
							console.log(result);
							real_id.push(result[0].last);
							console.log("New patient id: "+real_id[0]);
							var temp_id_date= format_date_fn(data);
							console.log(temp_id_date);
							var con = mysql.createConnection(dbconfig.connection);
							con.query("INSERT INTO tbl_tmp_id(id,date) VALUES (? ,?)",[result[0].last,temp_id_date],function(err,resu){
								if(err){
									console.log(err);
									pop_err();
								}
								console.log("Temp table result");
								console.log(resu);
							});

						}
					})

				}
  			if(true){
					//If there is real id use it else use one from created entry
					if(result.length>0){
  			console.log("Real id: "+result[0].id);
  			real_id.push(result[0].id);
															}



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
  			// Testing for correct splitashion XD
  			console.log("Date: "+ format_date + " Time: "+ data_time);
				//Add entry of ids on table
				console.log("real_id status");
				console.log(typeof real_id[0]);
				if(!dates.includes(format_date)||!ids.includes(real_id[0])){
					if(!dates.includes(format_date)){
					dates[date_ind]=format_date;
					date_ind++;
					}
					else{
						ids[ids_ind]=real_id[0];
						ids_ind++;
					}

					// New conection
	  			var con = mysql.createConnection(dbconfig.connection);
					//Insert
					if(typeof real_id[0]!='undefined'){
					con.query("INSERT INTO tbl_tmp_id(id,date) VALUES (? ,?)",[real_id[0],format_date],function(err,resu){
						if(err){
							console.log(err);
							pop_err();
						}
						console.log("Temp table result");
						console.log(resu);
					});
				}
					con.end();


				}

  			// New conection
  			var con = mysql.createConnection(dbconfig.connection);
  			//Second query
  			con.query("SELECT * FROM tbl_consult WHERE id_patient=? and date_consult=?",[real_id[0],format_date],function (err_b,result_b){

  			if(err_b) {
					console.log(err_b);
					pop_err();
				}

				//Check for option 4 no record found
				else if(result_b.length<=0){
					console.log("Option 4 ,No entries found, creating entry");

					//Formating provider name
					var prov_name = data.c_staffname.split(",");
					var prov_last = prov_name[0];
					var prov_fname = prov_name[1].slice(1);
					console.log("Provider first name: "+ prov_fname);
					console.log("Provider last name: "+ prov_last);
					//Retriving real provider id

					//Create new sql connection
					var con = mysql.createConnection(dbconfig.connection);

					get_prov(con,prov_fname,prov_last,function(err,id){
						if(err){
							console.log(err);
							pop_err();
						}
						else if (id.length>0){
							console.log("Real provider id: "+ id[0].id);
							//Create new connection for subquery
							var con = mysql.createConnection(dbconfig.connection);

							//Creating new entries
							var insert_real_id=real_id.shift();

						add_new(con,format_date,data_time,insert_real_id,id[0].id,function(err,result){
								if(err) {
									console.log(err);
									pop_err();
								}
								else{
									console.log("Result for entry creation");
									console.log(result);
									//Create log
									var qry1="UPDATE tbl_log_csv SET create_entry=create_entry+? WHERE id=?";
									var value= result.affectedRows;
									console.log("affectedrows: "+ value);
									update_log(con,qry1,value,log_id,function(err,res){
										if(err)console.error(err);
										else{
											console.log(res);
											//End conection
											con.end();
										}
									})





								}
							})

						}
					})





					//Call store procedure

				}
				//Del count
				var del_count=0;
  			//Loop trough results
  			for(var i =0; i<result_b.length;i++){
  			console.log("Result date from 2nd Query:"+ result_b[i].date_consult);


				//Check for option 1 and 3
  			if(result_b[i].id_state==4){
					console.log("Option 1 and 3 found, deleting all non 4 states")
					//Create new sql connection
					var con = mysql.createConnection(dbconfig.connection);
					remove_not(con,real_id[0],format_date,function(err,result){
						if(err){
							console.log(err);
							pop_err();
						}
						else {
							console.log("Found 4 state result\n");
							console.log(result);
							//Create log
							//New connection needed for log
							var con = mysql.createConnection(dbconfig.connection);
							//Query builder
							var qry2="UPDATE tbl_log_csv SET del_non_4=del_non_4+? WHERE id=?";
							var value= result.affectedRows;
							console.log("affectedrows: "+ value);
							update_log(con,qry2,value,log_id,function(err,res){
								if(err){
									console.log(err);
									pop_err();
								}
								else{
									console.log(res);
									//End conection
									con.end();
								}
							})
						}
					})
				}
  			//Check for option 2 no time match in DB
  				if(result_b[i].start_consult!=data_time){
						var temp_id =result_b[i].id;
						console.log(temp_id);
  					console.log("Option 2, Time from DB does not match CSV");
						//Create new sql connection
						var con = mysql.createConnection(dbconfig.connection);
						//Format end time
						var temp_data_b = data.t_ap_endtime.split(" ");

						//Check for missing 0 in time format
		  			if(temp_data_b[1][1]==":"){
		  				temp_data_b[1]="0"+temp_data_b[1];
		  			}
		  			//Finish correcting wrong time format
		  			var data_time_b = temp_data_b[1]+":00";
				//Call update time
						update_time (con,data_time,data_time_b,temp_id,function(err,result){
							if(err){
								console.log(err);
								pop_err();
							}
							else {
									console.log("Time update result\n");
									console.log(result);
									//Create new sql connection
									var con = mysql.createConnection(dbconfig.connection);

									//Query builder

									var qry5="UPDATE tbl_log_csv SET time_non_match=time_non_match+? WHERE id=?";
									var value= result.affectedRows;
									console.log("affectedrows: "+ value);
									update_log(con,qry5,value,log_id,function(err,res){
										if(err){
											console.log(err);
											pop_err();
										}
										else{
											console.log(res);
											//End conection
											con.end();
										}
									})
									//Create new sql connection
									var con = mysql.createConnection(dbconfig.connection);

									//Delete wrong times
									if(result_b.length>1){
										//Create new sql connection
										var con = mysql.createConnection(dbconfig.connection);
									del_two(con,format_date,real_id[0],temp_id,function(err,result){
										if(err) {
											console.log(err);
											pop_err();
										}
										else{
											console.log("Delete wrong time result");
											console.log(result);
											//Query builder
											var qry3="UPDATE tbl_log_csv SET time_non_match=time_non_match+? WHERE id=?";
											var value= result.affectedRows;
											console.log("affectedrows: "+ value);
											update_log(con,qry3,value,log_id,function(err,res){
												if(err)console.error(err);
												else{
													console.log(res);
													//End conection
													con.end();
												}
											})
											del_count++;
										}
									})
																		}
								}
						})




  				}
  				else if(del_count<1){

  					console.log("Time from DB matches CSV");
						var temp_id_2 =result_b[i].id;

						//Create new sql connection
						var con = mysql.createConnection(dbconfig.connection);
						del_two(con,format_date,real_id[0],temp_id_2,function(err,result){
							if(err) {
								console.log(err);
								pop_err();
							}
							else{
								console.log("Delete all but one matching time");
								console.log(result);
								//Create new sql connection
								var con = mysql.createConnection(dbconfig.connection);
								//Query builder
								var qry4="UPDATE tbl_log_csv SET time_match=time_match+? WHERE id=?";
								var value= result.affectedRows;
								console.log("affectedrows: "+ value);
								//Export log id

								update_log(con,qry4,value,log_id,function(err,res){
									if(err){
										console.log(err);
										pop_err();
									}
									else{
										console.log(res);
										//End conection
										con.end();
									}
								})


							}


					})
							del_count++;


  				}



  		}


      con.end();
      console.log("MySql conneciton ended");





    })
		//End SQL connection
		con.end();
  		}

    })



  }
  	} )


  		.on("end", function(){
        console.log("CSV file closed");





      });





  	//Retrive affected rows

  	//Create conection


  //MYSQL_CONNECTION_END=======================
  	res.render('sql_done');





  })


  };
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

	function create_log(con,req,date,callback){

		//date = date.toString();
		con.query('INSERT INTO tbl_log_csv (username,date) VALUES (?,?)',[req.user.username,date],function(err,result){
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
		con.query('INSERT INTO tbl_patient (numid_patient,firstname_patient,lastname_patient,gender_patient,datebirth_patient) VALUES(?,?,?,?,?)',[data.c_pe_patient_id,name[1],name[0],"M",dob],function(err,result){
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
	//Function update log
	function update_log(con,query,value,id,callback){
		con.query(query,[value,id],function(err,result){
			if(err)callback(err,null);
			else{
				callback(null,result);
			}
		})
	}


//Error text box function

function pop_err(){
	var dialog = require('dialog');
	dialog.warn("There was an error!,\nPlease reference to console for more details.");
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
