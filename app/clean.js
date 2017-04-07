module.exports = function (app, passport){
var mysql = require('mysql');
var keys= require('./keys.js')
var password = keys.pass;



//Get clean ejs

app.get('/clean',isLoggedIn, function(req,res){
  res.render('clean');

});

//Post clean ejs

app.post('/clean',isLoggedIn, function(req,res){
  //Create connection
  var con = mysql.createConnection({
	  				host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
	  				user:"swe",
	  				password:password,
	  				database: "it01_db_beta01e_medicalpractice"
	  			});
    //Get log ID
    get_log_id(con,function(err,result){
      if(err)console.log(err);
      else{
        console.log(result);
      }
    })
    // Get ID using function
        getID(con, function(err,data){
          if(err){
            console.log(err);
          }
          else{

            data.forEach(function(result){
              console.log(result.id);
              remove(con,result,function(err,res){
                if(err)console.log(err);
                else{
                  console.log(res);
                }
              })
            });
            //Delete table after used
            del_table(con,function(err,result){
              if(err)console.log(err);
              else{
                console.log(result);
              }
            })
            con.end();
            res.render('clean_done');
          }
        })
        //Close connection




});



}
//Function to get table numbers
function getID (con,callback){
  con.query('SELECT tbl_consult.id FROM tbl_consult , tbl_tmp_id  WHERE tbl_consult.date_consult=tbl_tmp_id.date AND tbl_consult.id_patient NOT IN(SELECT id FROM tbl_tmp_id) ', function(err,result){
    if(err){
      console.log(err);
      callback(err,null);
    }
      else {
        callback(null,result);
      }
  })

}

//Function to remove entries
function remove (con,row,callback){
  con.query('CALL 00000_Delete_APP_RECORD(?)',[row.id],function(err,result){
    if(err)
      callback(err,null);
      else {
        callback(null,result);
      }
  })

}
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
//Function to get las id

function get_log_id (con,callback){
  con.query("SELECT LAST_INSERT_ID() as last FROM tbl_log_csv", function(err,result){
    if(err)callback(err,null);
    else{
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
