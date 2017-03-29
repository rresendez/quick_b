module.exports = function (app, passport){
var mysql = require('mysql');



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
	  				password:"ingenium2015",
	  				database: "it01_db_beta01e_medicalpractice"
	  			});
    // Get ID using function
        getID(con, function(err,data){
          if(err){
            console.log("error");
          }
          else{
            data.forEach(function (row,err){
              console.log(row);
              remove(con,row,function(err,res){
                if(err){
                  console.log(err);
                }
                else{
                  console.log(res);
                }
              })
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
  con.query('SELECT * from tbl_tmp_id', function(err,result){
    if(err)
      callback(err,null);
      else {
        callback(null,result);
      }
  })

}

//Function to remove entries
function remove (con,row,callback){
  con.query('DELETE from tbl_tmp_id WHERE id=?',[row.id],function(err,result){
    if(err)
      callback(err,null);
      else {
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
