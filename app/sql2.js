module.exports = function (app,passport){
  //Dependencies
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
  //Retrive log id
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
          // Test for no id on patient table AKA create new patient
          if(resu.length==0){
            console.log("No patient found");
            //Declare new patient ID and provider ID var
            var newPID;
            var proID;
            var format_date;
            var state = data.status[0];
            //Add patient that doesn't exists
            add_patient(con,data,function(err,patID){
              if(err){ console.log(err); pop_err();}
              else{
                console.log(patID);

                //Assgin new idd and get provider ID
                newPID= patID[0].id;
                console.log("New patient added, patient id is:"+ newPID);
                get_prov(con,data,function(err,provID){
                  if(err){
                    console.log(err);
                    pop_err();
                  }
                  else{
                    console.log(provID);

                    //Get provider ID
                    proID=provID[0].id;
                    console.log("Provider ID: "+ proID);
                    //Format date
                    format_date = format_date_fn(data);
                    add_new(con,format_date,newPID,proID,function(err,entry){
                      if(err){ console.log(err); pop_err();}
                      else{
                        console.log("New consult added");
                        updateState(con,state,newPID,format_date,function(err,updateState){
                          if(err)console.lo(err);
                          else{
                            console.log("State updated");
                            console.log("Log id: "+ log_id);
                            var query = "UPDATE tbl_log_csv SET state_update=state_update+? WHERE id=?";
                            update_log(con,query,updateState.affectedRows,log_id,function(err,res){
                              if(err){ console.log(err); pop_err();}
                              else{
                                console.log(res);
                                console.log("Log updated");
                              }
                            })

                          }

                        })

                      }

                    })

                  }
                })

              }


            })


        }
        //Else if real id exists just use that one
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
  console.log("incoming state "+state);
  var fixedS=state_correct(state);
  console.log(fixedS);
  con.query("UPDATE tbl_consult SET id_state=? WHERE id_patient=? AND date_consult=? ",[fixedS,temp_id,format_date],function(err,result){
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
    else{

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
  var pathB="upload/testb.csv";
  if(fs.existsSync(pathB)){
  fs.unlinkSync("./upload/testb.csv");
}
}
function final_clean(){
  var path="./upload/test.csv";
  var pathB="upload/testb.csv";
  if(fs.existsSync(pathB)&&fs.existsSync(path)){

  fs.unlinkSync(path);
  fs.unlinkSync(pathB);
}


}
// function state corrector
function state_correct(state){
    var initialState=0;
    var fixedState;
    initialState=state;
  switch (initialState) {
    case '1':
    fixedState=3;
      break;
    case '2':
    fixedState=5;
      break;
    case '3':
    fixedState=6;
      break;
    default:
    fixedState=8;
    break;

  }
  return fixedState;
}
//Function get provider

function get_prov(con,data,callback){
  //Formating provider name
  var prov_name = data.c_st_name.split(",");

  var prov_fname = prov_name[1].slice(1);
  console.log("Provider first name: "+ prov_fname);


  con.query('SELECT id FROM tbl_user WHERE fristname_user=?',[prov_fname],function(err,id){
    if(err) callback(err,null);
    else if(id.length>0){
       callback(null,id);}
       else{
         console.log("No provider found");
         pop_err();
       }

  })
}

//Function add Patient
function add_patient(con,data,callback){
  var name = data.patname.split(",");
  con.query('INSERT INTO tbl_patient (numid_patient,firstname_patient,lastname_patient,gender_patient) VALUES(?,?,?,?)',[data.patid,name[1][1],name[0][0],"M"],function(err,result){
    if(err) callback(err,null);
    else{
      get_new_id(con,data,function(err,result){
        if(err) callback(err,null);
        else{
          callback(null,result);
        }
      })
    }
  })
}
//Function get new id
function get_new_id (con,data,callback){
		con.query("SELECT id FROM tbl_patient WHERE numid_patient=? ",[data.patid],function(err,res){
			if (err) callback(err,null);
			else{
				callback(null,res);
			}})


	}
  //Function to add new entry
	function add_new(con,format_date,real_id,id_provider,callback){
		con.query('CALL 00000_Create_APP_RECORD(?,?,?,?)',[format_date,"08:00",real_id,id_provider],function(err,result){
			if(err) callback(err,null);
			else callback(null,result);
		})
	}
  // Function format date
  function format_date_fn (data){
  	//Split csv date into date and time
  	var temp_data = data.apptdate.split(" ");

  	//Check for missing 0 in date format
  	if(temp_data[0][1]=="/"){
  		temp_data[0]="0"+temp_data[0];
  	}
  	//Assing date to variable
  	var data_date = temp_data[0];

  	//Correct CSV date format
  	var format_date=data_date.split("/");

   format_date= format_date[2]+"-"+format_date[0]+"-"+format_date[1];
   return format_date;
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
