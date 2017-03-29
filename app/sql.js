module.exports = function(app, passport) {

	var fs = require('fs');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var ids_ind=0;
	var call =0;





  //=======================================
  //FORM_PROCESS===========================
  //=======================================
  app.post('/sql',isLoggedIn, function(req, res){
		var ids=[];
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
				if(!ids.includes(real_id)){
					ids[ids_ind]=real_id;
					// New conection
	  			var con = mysql.createConnection({
	  				host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
	  				user:"swe",
	  				password:"ingenium2015",
	  				database: "it01_db_beta01e_medicalpractice"
	  			});
					//Insert
					con.query("INSERT INTO tbl_tmp_id VALUES (? ,?)",[real_id,format_date],function(err,resu){
						if(err){
							console.log("Error attempting to insert new row");
						};
						console.log(resu);
					});
					con.end();

					ids_ind++;
				}
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
				//Check for option 4 no record found
				if(result_b.length<=0){
					console.log("Option 4 ,No entries found, creating entry");
					//Call store procedure
					con.query("CALL 00000_Create_APP_RECORD(?,?,?,?)",[format_date,real_id,data.t_ap_starttime,data.c_ap_confirm],function(err_c,result_c){
						if(err_c) console.log(err_c);
						else console.log(result_c);
					})
				}
  			//Loop trough results
  			for(var i =0; i<result_b.length;i++){
  			console.log("Result date from 2nd Query:"+ result_b[i].date_consult);
  			//Check state for row completion
				//Check for option 1
  			if(result_b[i].id_state==4){
					console.log("Option 1 and 3, State 4 found\nDelete other entries");



				}
  			//Check for option 2 no time match in DB
  				if(result_b[i].end_consult!=data_time){
  					console.log("Option 2, Time from DB does not match CSV");


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


      con.end();
      console.log("MySql conneciton ended");




    })
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

  // route middleware to make sure
  function isLoggedIn(req, res, next) {

  	// if user is authenticated in the session, carry on
  	if (req.isAuthenticated())
  		return next();

  	// if they aren't redirect them to the home page
  	res.redirect('/');
  }