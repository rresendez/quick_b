module.exports = function (app,passport){
  var fs= require('fs');
  var csv = require('fast-csv');
  var mysql = require ("mysql");

//=======================================
//Second stage csv===========================
//=======================================

//Execute route

app.post('/sql2', isLoggedIn, function(req,res){

  //Load CSV
  var stream = fs.createReadStream('./upload/testb.csv');
  //Create SQL connection
  var con = mysql.createConnection({
    host: "inartec-db1.caqs6gipj1jl.sa-east-1.rds.amazonaws.com",
    user:"swe",
    password:"ingenium2015",
    database: "it01_db_beta01e_medicalpractice"
  });
  //Open CSV
  csv
    .fromStream(stream,{headers:true})
    .on("data",function (data){
      getID(con,data,function(err,resu){
        if(err) console.log(err);
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
            if(err)console.log(err);
            else {
            console.log("State on db updated");
            console.log(result);
            con.end();
          }
          })

        }
      })




    })
    .on("end", function(){
      console.log("CSV file closed");
    })


  res.render('sql2_done');

})
// Function update state

function updateState(con,state,temp_id,format_date,callback){
  con.query("UPDATE tbl_consult SET id_state=? WHERE id_patient=? AND date_consult=? ",[state,temp_id,format_date],function(err,result){
    if(err)console.log(err);
    else{
      console.log(result);
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

// route middleware to make sure
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

}
