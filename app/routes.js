

// app/routes.js
module.exports = function(app, passport) {


	var multer = require('multer');

	var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './upload/')
	},
	filename: function (req, file, cb) {
		cb(null,'test.csv');
	}
});

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

//=======================================
//UPLOAD=================================
//=======================================
// show upload form
app.get('/upload',isLoggedIn, function(req, res){
	res.render('upload.ejs');
});

// show result from input
app.post('/upload',isLoggedIn, function(req,res){
	upload(req,res, function (err){
		if(err){
			console.log(err);
		}

		 console.log("Inside");
		  console.log(req.file);
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
