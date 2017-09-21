var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/quick_b";

MongoClient.connect(url,function(err,db){
  if(err) {console.log(err);}
  else{ console.log("Database created!");
  }
  db.createCollection("csv",function(err,res){
    if(err) console.log(err);
    else{
    console.log("Collection created!");
  }
  })

  

});
