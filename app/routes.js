

// app/routes.js
module.exports = function(app, passport) {
//Dependencies

	var multer = require('multer');
	var csv = require('fast-csv');
	var mysql = require("mysql");
	var dialog = require('dialog');
	const csv_a="c_staffname,c_office_name,d_ap_date,t_ap_starttime,t_ap_endtime,c_ap_confirm,c_pe_patient_id,c_pe_name,n_pe_age,c_ap_code,c_ap_desc,c_pe_wphone,c_pe_hphone,c_pe_w_ext,c_ref_name,c_ap_note,c_pe_chart,n_bl_id,d_pe_dob,m_pe_ins_due,m_pe_pat_due,n_pe_id,name_1,c_apc_id,c_user_id,c_vrc_desc,l_apt_new_patient,c_st_id";
	var dbconfig = require('../config/database');

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

				var con = mysql.createConnection(dbconfig.connection);

				//Estabilishg connection

				con.connect(function(err){
					if(err){
						console.log('Error conecting to MySQL');
						return;
					}
					console.log('Connection to MySQL established');
				});
				// Get user name from session in order to find corresponding logs
				var userN =req.user.username;
				console.log(userN);
				con.query("SELECT * FROM tbl_log_csv WHERE username=? ",[userN],function(err,rows){
					if(err)console.log(err);
					else{
         console.log(rows);
				 con.end();
				 //Rendering logs and passing the data of results from query as data
				 res.render('logs.ejs',{data:rows});
			 		}
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
var con = mysql.createConnection(dbconfig.connection);
	uploadB(req,res, function (err){
		if(err){
			console.log(err);
			pop_err();
		}

		 console.log("Buffer");
		 //Ensures the uploaded file matches the fromat from the csv
		 var buff = req.file.buffer.toString('utf-8',0,312)
     if(csv_a!=buff){
			 dialog.warn("The file you uploaded, does not match the csv format, please try again.");
			 res.redirect('/upload');

		 }

	})
// If the format matches go ahead an upload the file
del_table(con,function(err,res){
	if(err) {console.log(err);
						pop_err();}else{
							console.log("Truncating temp id table");
							console.log(res);
						}
})

	upload(req,res, function (err){
		if(err){
			console.log(err);
			pop_err();
		}

		 console.log("Inside");
		  console.log(req.file);
			//Render execution page and passes file information to ensure the file is correct
			res.render('sql.ejs', { file: req.file });
	})
});
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
	app.get('/signup',isLoggedIn,  function(req, res) {
		// render the page and pass in any flash data if it exists
		console.log(req.user.id);
		//This ensures that only admins
		if(req.user.id==1||req.user.id==2||req.user.id==3){
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
  // =====================================
	// SECOND STAGE ========================
	// =====================================
  app.get('/second', function(req,res){
    res.render('clean_done');
  });



};

//Error text box function

function pop_err(){
  var dialog = require('dialog');
	var fs = require('fs-extra');
  dialog.warn("There was an error!,\nPlease reference to console for more details.");
	var path="upload/test.csv";

	if(fs.existsSync(path)){
	fs.unlinkSync(path);

}}
//Function drop table
function del_table (con,callback){
  con.query('TRUNCATE tbl_tmp_id ',function(err,result){
    if(err)callback(err,null);
    else{
      console.log("Table tbl_tmp_id deleted");
      callback(null,result);
    }
  })
}
// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
