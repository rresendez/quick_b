

// app/routes.js
module.exports = function(app, passport) {


	var multer = require('multer');
	var fs = require('fs');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var dialog = require('dialog');
	const csv_a="c_staffname,c_office_name,d_ap_date,t_ap_starttime,t_ap_endtime,c_ap_confirm,c_pe_patient_id,c_pe_name,n_pe_age,c_ap_code,c_ap_desc,c_pe_wphone,c_pe_hphone,c_pe_w_ext,c_ref_name,c_ap_note,c_pe_chart,n_bl_id,d_pe_dob,m_pe_ins_due,m_pe_pat_due,n_pe_id,name_1,c_apc_id,c_user_id,c_vrc_desc,l_apt_new_patient,c_st_id";
	var keys = require('./keys');
  var passw = keys.pass;

// Configure multer for file name and location
	var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './upload/')
	},
	filename: function (req, file, cb) {
		cb(null,'test.csv');
	}


});
// initialize upload object with multer for single file
	var uploadB = multer({ storage: multer.memoryStorage({}) }).single('csv');
	var upload = multer({storage: storage}).single('csv');





	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// =====================================
	// LOGS ===============================
	// =====================================
	// show the logs
	app.get('/logs', isLoggedIn,function(req,res){

		//MYSQL_CONNECTION=======================

				//MySQL conneciton to db

				var con = mysql.createConnection({
					host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
					user:"swe",
					password:"ingenium2015",
					database: "it01_db_beta01e_medicalpractice"
				});

				//Estabilishg connection

				con.connect(function(err){
					if(err){
						console.log('Error conecting to MySQL');
						return;
					}
					console.log('Connection to MySQL established');
				});
				con.query("SELECT * FROM logs ORDER BY date DESC ",function(err,rows){
         console.log(rows);
				 res.render('logs.ejs',{data:rows});

				})


	});

//=======================================
//UPLOAD=================================
//=======================================
// show upload form
app.get('/upload',isLoggedIn, function(req, res){
	res.render('upload.ejs');
});

// show result from input
app.post('/upload',isLoggedIn, function(req,res){
//Check buffer to ensure csv format match

	uploadB(req,res, function (err){
		if(err){
			console.log(err);
		}

		 console.log("Buffer");
		 var buff = req.file.buffer.toString('utf-8',0,312)
     if(csv_a!=buff){
			 dialog.warn("The file you uploaded, does not match the csv format, please try again.");
			 res.redirect('/upload');

		 }

	})
// If the format matches go ahead an upload the file


	upload(req,res, function (err){
		if(err){
			console.log(err);
		}

		 console.log("Inside");
		  console.log(req.file);
			res.render('sql.ejs', { file: req.file });
	})
});
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

	csv
	  .fromStream(stream, {headers: true})
	// Validation

	  .on("data", function(data){

//MYSQL_CONNECTION=======================

    //MySQL conneciton to db

		var con = mysql.createConnection({
			host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
			user:"swe",
			password:"ingenium2015",
			database: "it01_db_beta01e_medicalpractice"
		});

    //Estabilishg connection

    con.connect(function(err){
      if(err){
        console.log('Error conecting to MySQL');
        return;
      }
      console.log('Connection to MySQL established');
    });
/**********THIS ARE THE OLD QUERIES

    //Creating query
    var qry_cnt = "SELECT count(1) AS num,count(statecode) AS state from csv where policyID=";
    qry_cnt=qry_cnt+data.policyID;

    con.query(qry_cnt,function(err,rows){
      if(err) throw err;


     console.log(rows[0].num);
     //Insert
     //Check if no record
     if(rows[0].num<1){

       console.log("Entry on CSV not found in SQL, adding entry")
       var qry_inst = "INSERT INTO csv VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
     //Insert unexistend rows
     con.query(qry_inst,[data.policyID,data.statecode,data.county,data.eq_site_limit,data.hu_site_limit,data.fl_site_limit,data.fr_site_limit,data.tiv_2011,data.tiv_2012,data.eq_site_deductible,data.hu_site_deductible,0,0,data.point_latitude,data.point_longitude,data.line,data.construction,data.point_granularity],
       function(err,result){
         if(err) throw err;
				 console.log(result);
         console.log('Changed '+ result.affectedRows + ' rows');
				 var d = new Date();


				 con.query("INSERT INTO logs (date, rows_affected,username) VALUES(?,?,?) ON DUPLICATE KEY UPDATE rows_affected = rows_affected + 1",[d.toString(),1,req.user.username],
				function(err){
					if(err) throw err;

				console.log("Log created!");
			}
			)



       }


     )
   }


		})
	})
	*/


		//CSV_END====================================
		//Get ID from tbl_patient

		if(data.c_pe_patient_id!=""){
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
				}
				else{
					console.log("Time from DB matches CSV");
				}

			}
		}


			})
		}
		})
	}
	con.end();
	console.log("MySql conneciton ended");
	} )


		.on("end", function(){
      console.log("CSV file closed, have a nice day ;)");

    });

	//Retrive affected rows

	//Create conection


//MYSQL_CONNECTION_END=======================
	res.render('sql_done');

})




	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', isLoggedIn, function(req, res) {
		// render the page and pass in any flash data if it exists
		console.log(req.user.id);
		if(req.user.id==1){
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	}
	else {
		res.redirect('/');
	}
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
