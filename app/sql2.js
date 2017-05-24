module.exports = function (app,passport){
  var fs= require('fs');
  var csv = require('fast-csv');
  var mysql = require ("mysql");

  var myModule= require('./sql.js');
	var dbconfig = require('../config/database');

//=======================================
//Second stage csv===========================
//=======================================

//Execute route

app.post('/sql2', isLoggedIn, function(req,res){
  var log_id=myModule.log;

  //Load CSV
  var stream = fs.createReadStream('./upload/testb.csv');
  //Create SQL connection
  var pool = mysql.createPool(dbconfig.connection);

  pool.getConnection(function (err, con){
    if(err){
      console.log(err);
    }
  //Open CSV
  csv
    .fromStream(stream,{headers:true})
    .on("data",function (data){
      getID(con,data,function(err,resu){
        if(err) {
          console.log(err);
          pop_err();
        }
        else{
          //Get real id
          var temp_id = resu[0].id;
          //Get status
          var state = data.status[0];
          //Get date
          var date = data.apptdate;
          //Format Date
          var format_date=date.split("/");
          format_date= format_date[2]+"-"+format_date[0]+"-"+format_date[1];

          console.log("Real id: " + temp_id);
          console.log("Status:" + state);
          //Call update funciton
          updateState(con,state,temp_id,format_date,function(err,result){
            if(err){
              console.log(err);
              pop_err();
            }
            else {
              //Create SQL connection
              //var con = mysql.createConnection(dbconfig.connection);

              var query = "UPDATE tbl_log_csv SET state_update=state_update+? WHERE id=?";
              update_log(con,query,result.affectedRows,log_id,function(err,res){
                if(err){
                  console.log(err);
                  pop_err();
                }
                else{
                  console.log(res);
                }
              })
            console.log("State on db updated");
            console.log(result);


          }
          })

        }
      })




    })
    .on("end", function(){
      console.log("CSV file closed");
    })
  })


  final_clean(res);
  res.render('sql2_done');

})
// Function update state

function updateState(con,state,temp_id,format_date,callback){
  con.query("UPDATE tbl_consult SET id_state=? WHERE id_patient=? AND date_consult=? ",[state,temp_id,format_date],function(err,result){
    if(err) callback(err,null);
    else{
      callback(null,result);
    }
  })
}


// Function to get id
function getID(con,data,callback){
  con.query("SELECT * FROM tbl_patient WHERE numid_patient=?",[data.patid],function(err,result){
    if(err)callback(err,null);
    else if (result.length>0){

        callback(null,result);
    }
  })

}
//Function update log
function update_log(con,query,value,id,callback){
  con.query(query,[value,id],function(err,result){
    if(err)callback(err,null);
    else{
      callback(null,result);
    }
  })
}
//Error text box function

function pop_err(){
  var fs = require('fs-extra');
  var dialog = require('dialog');
  dialog.warn("There was an error!,\nPlease reference to console for more details.");
  fs.unlinkSync("./upload/testb.csv");
}
function final_clean(){
  var path="./upload/test.csv";
  var pathB="upload/testb.csv";
  if(fs.existsSync(pathB)&&fs.existsSync(path)){

  fs.unlinkSync(path);
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
