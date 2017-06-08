// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8081;

var passport = require('passport');
var flash    = require('connect-flash');


// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration



// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({

}));
app.use(bodyParser.json());


app.set('view engine', 'ejs'); // set up ejs for templating

//Sets the static files reference for the program when requesting for static files on the html
app.use(express.static("public"));

// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/sql.js')(app, passport);
require('./app/clean.js')(app, passport);
require('./app/bupload.js')(app, passport);
require('./app/sql2.js')(app, passport);
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
