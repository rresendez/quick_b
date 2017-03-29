module.exports = function (app, passport){
  var multer = require('multer');
  const csv_a="c_staffname,c_office_name,d_ap_date,t_ap_starttime,t_ap_endtime,c_ap_confirm,c_pe_patient_id,c_pe_name,n_pe_age,c_ap_code,c_ap_desc,c_pe_wphone,c_pe_hphone,c_pe_w_ext,c_ref_name,c_ap_note,c_pe_chart,n_bl_id,d_pe_dob,m_pe_ins_due,m_pe_pat_due,n_pe_id,name_1,c_apc_id,c_user_id,c_vrc_desc,l_apt_new_patient,c_st_id";

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
  		}

  		 console.log("Buffer");
  		 var buff = req.file.buffer.toString('utf-8',0,312)
       if(csv_a!=buff){
  			 dialog.warn("The file you uploaded, does not match the csv format, please try again.");
  			 res.redirect('/clean_done');

  		 }

  	})
  // If the format matches go ahead an upload the file


  	upload(req,res, function (err){
  		if(err){
  			console.log(err);
  		}

  		 console.log("Inside");
  		  console.log(req.file);
  			res.render('2csv_done.ejs', { file: req.file });
  	})
  });

  // route middleware to make sure
  function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
  }


}
