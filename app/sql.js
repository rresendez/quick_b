module.exports = function(app, passport) {


	var multer = require('multer');
	var fs = require('fs');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var dialog = require('dialog');
	const csv_a="c_staffname,c_office_name,d_ap_date,t_ap_starttime,t_ap_endtime,c_ap_confirm,c_pe_patient_id,c_pe_name,n_pe_age,c_ap_code,c_ap_desc,c_pe_wphone,c_pe_hphone,c_pe_w_ext,c_ref_name,c_ap_note,c_pe_chart,n_bl_id,d_pe_dob,m_pe_ins_due,m_pe_pat_due,n_pe_id,name_1,c_apc_id,c_user_id,c_vrc_desc,l_apt_new_patient,c_st_id";
	var keys = require('./keys');
  var passw = keys.pass;


  //=======================================
  //FORM_PROCESS===========================
  //=======================================
  app.post('/sql',isLoggedIn, function(req, res){
  //FILE_SYSTEM_CSV========================
  	//File location

  	var stream = fs.createReadStream('./upload/test.csv');
  	//Opening CSV
  	  console.log("Retriving info from CSV");
  	//CSV fast-csv object setup

    //Create MySQL connection
    var con = mysql.createConnection({
      host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
      user:"swe",
      password:"ingenium2015",
      database: "it01_db_beta01e_medicalpractice"
    });


  	csv
  	  .fromStream(stream, {headers: true})

  	// Validation


  	  .on("data", function(data){

  //MYSQL_CONNECTION=======================

      //MySQL conneciton to db
  	if(data.c_pe_patient_id!=""){



      //Estabilishg connection

      con.connect(function(err){
        if(err){
          console.log('Error conecting to MySQL');
          return;
        }
        console.log('Connection to MySQL established');
      });



  		console.log("Patient id: "+data.c_pe_patient_id);
  		con.query("SELECT * FROM tbl_patient WHERE numid_patient=?",[data.c_pe_patient_id], function(err,result){
  			if(err) throw err;
  			if(result.length>0){
  			console.log("Real id: "+result[0].id);
  			var real_id=result[0].id;

  			//Begin second query on tbl_patient
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
  			// New conection
  			var con = mysql.createConnection({
  				host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
  				user:"swe",
  				password:"ingenium2015",
  				database: "it01_db_beta01e_medicalpractice"
  			});
  			//Second query
  			con.query("SELECT * FROM tbl_consult WHERE id_patient=? and date_consult=?",[real_id,format_date],function (err_b,result_b){

  			if(err_b) throw err_b;
  			//Loop trough results
  			for(var i =0; i<result_b.length;i++){
  			console.log("Result date from 2nd Query:"+ result_b[i].date_consult);
  			//Check state for row completion
  			if(result_b[i].id_state!=4){
  			//Check for no time match in DB
  				if(result_b[i].end_consult!=data_time){
  					console.log("Time from DB does not match CSV");
            //Third inner Query
            /*con.query("SELECT * FROM tbl_consult WHERE id_patient=? ",[real_id],function (err_c,result_c){
              if(err_c) throw err_c;
              console.log("Result c: "+result_c[0].id);
            })*/


  				}
  				else{
  					console.log("Time from DB matches CSV");
  				}

  			}
  		}


      con.end();
      console.log("MySql conneciton ended");


    })
  		}

    })



  }
  	} )


  		.on("end", function(){
        console.log("CSV file closed, have a nice day ;)");


      });





  	//Retrive affected rows

  	//Create conection


  //MYSQL_CONNECTION_END=======================
  	res.render('sql_done');


  })


  };

  // route middleware to make sure
  function isLoggedIn(req, res, next) {

  	// if user is authenticated in the session, carry on
  	if (req.isAuthenticated())
  		return next();

  	// if they aren't redirect them to the home page
  	res.redirect('/');
  }
