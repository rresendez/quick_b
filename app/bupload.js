module.exports = function (app, passport){
  var multer = require('multer');
  var dialog = require('dialog');


  const csv_b="apptdate,statusdate,patid,patname,status,hphone,wphone,ext,apptcode,purpose,note,n_pe_id,c_of_id,c_of_name,c_st_id,c_st_name,c_crc_desc";

  // Configure multer for file name and location
  	var storage = multer.diskStorage({
  	destination: function (req, file, cb) {
  		cb(null, './upload/')
  	},
  	filename: function (req, file, cb) {
  		cb(null,'testb.csv');
  	}


  });
  // initialize upload object with multer for single file
  	var uploadB = multer({ storage: multer.memoryStorage({}) }).single('csv');
  	var upload = multer({storage: storage}).single('csv');


  app.post('/bupload',isLoggedIn, function(req,res){
  //Check buffer to ensure csv format match

  	uploadB(req,res, function (err){
  		if(err){
  			console.log(err);
        pop_err();


  		}

  		 console.log("Buffer");
  		 var buff = req.file.buffer.toString('utf-8',0,135)
       if(csv_b!=buff){
  			 dialog.warn("The file you uploaded, does not match the csv format, please try again.");
  			 res.render('clean_done');

  		 }

  	})
  // If the format matches go ahead an upload the file


  	upload(req,res, function (err){
  		if(err){
  			console.log(err);
        pop_err();
  		}

  		 console.log("Inside");
  		  console.log(req.file);
  			res.render('2csv_done.ejs', { file: req.file });
  	})
  });
  //Error test box function

  function pop_err(){
    var fs = require('fs-extra');
  	var dialog = require('dialog');
  	dialog.warn("There was an error!,\nPlease reference to console for more details.");

    var pathB="upload/testb.csv"
    if(fs.existsSync(pathB)){

    fs.unlinkSync(pathB);
  }
  }
  // route middleware to make sure
  function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
  }


}
