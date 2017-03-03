var mongo = require('mongodb');
var Server = mongo.Server,
    Db = mongo.Db,
    Dbname = 'gymuser',
    userTableName = 'users',
    promocodeTableName = 'promocode',
    oID = mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db(Dbname, server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to "+Dbname+" database");
        db.collection(userTableName, {strict:true}, function(err, collection) {
            if (err) {
                console.log("The "+userTableName +" collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
        db.collection(promocodeTableName, {strict:true}, function(err, collection) {
            if (err) {
                console.log("The "+promocodeTableName+" collection doesn't exist. Creating it with sample data...");
                populatePromocode();
            }
        });
    }
});
exports.increaseUsagePromocode = function(req, res){
    var id = req.params.id;
   
    db.collection(promocodeTableName, function(err, collection) {
    //     console.log(collection);
        var pid = new oID(id);
        collection.findOne({'_id': pid},function(err, item) {
            var data={'msg':'error'};
            if (err ) {
                data={'msg':'Error updating code: ' + err};
  
            } else {
               var usage = parseInt(item.usage), temp = {};
               temp['code'] = item.code;
               temp['usage'] = ++usage;
               collection.update({'_id': pid}, temp, {'w':1}, function(err, result) {
                    if (err){

                    }else{
 
                        data.msg='success';
                    }
                    res.send(data);
               });
            }
        });
    });
};
exports.regUserPaymentStatus = function(req, res){
    var id = req.params.id;
   
    var nowDate = new Date().toString() ;
 
    db.collection(userTableName, function(err, collection) {
        var pid = new oID(id);
        collection.update({'_id': pid}, {$set:{'isPremiumUser':true,'isPayDate':nowDate}}, function(err, result) {
            var data={'msg':'error'};
            if (err ) {
                data={'msg':'Error updating user: ' + err};
   
            } else {
 
                data.msg='success';
            }
            res.send(data);
        });
    });

};

exports.changePassword = function(req,res){
    var user = req.body;
    console.log('Updating user: ' + user.email);
    console.log(JSON.stringify(user));
    var data={'msg':'error'};

    db.collection(userTableName, function(err, collection) {
        var email = user.email, pwd=user.password;
        collection.update({'email': email}, {$set:{'password':pwd}}, function(err, result) {
            
            if (err ) {
                data={'msg':'Error updating user: ' + err};
   
            } else {
   
                data.msg='success';
            }
     
            if (data.msg=='success'){
                getUserInfo(res,collection,email,pwd);
            }else{
               res.send(data); 
            }
        });
        
    });
};
exports.findAll = function(req, res) {
    db.collection(userTableName, function(err, collection) {
 
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};
var getPromocodes = function(req, res) {
    db.collection(promocodeTableName, function(err, collection) {

        collection.find().toArray(function(err, items) {
            console.log(items);
            return items;
        });
    });
    return null;
};
var checkPaymentStatus = function(item){
    var nowDate = new Date(),
        dateStr = item.isPayDate||"01/01/3000",
        regDate = new Date(dateStr);
    var timeDiff = nowDate.getTime() - regDate.getTime();
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
 
    item.isPremiumUser = (diffDays>30|| diffDays<0)?false:true;   
    return item;
}
var getUserInfo = function(res,collection, email,pwd){
    var resItem ={};
    collection.findOne({'email':email}, function(err, item) {
 
        var data={'msg':'error','item':''};
        if (err ){
            data.msg="Error confirming user: " + err;
   
        }else{
            if(item==null){
                data.msg="No existing user. please sign up now.";
            }else{
   
                var spwd = item['password'];
                if (pwd == spwd){ 
                    data.msg = "success"; 
                    resItem = item;
                }
                else
                  data.msg="Your password incorrect. please try agin";  
            }
             
        }
        if (data.msg =="success"){

            db.collection(promocodeTableName, function(err, collection) {
                collection.find().toArray(function(err, items) {
                    resItem['promocodes'] = items;
                    resItem = checkPaymentStatus(resItem);
                    data.item = JSON.stringify(resItem);
                    res.send(data);
                });
            });  
        }else{
            
            res.send(data);
        }
       
    });
};
exports.confirmUser = function(req,res){
    var user = req.body;
 //   console.log('Checking user: ' + JSON.stringify(user));
    var email = user.email, pwd= user.password;
    var resItem ={};
    db.collection(userTableName, function(err, collection) {
        getUserInfo(res,collection,email,pwd);
   
    });
};
exports.addUser = function(req, res) {
    var user = req.body;
    var email = user.email, pwd= user.password;
    db.collection(userTableName, function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result) {
            var data={'msg':'error'};
            if (err) {
               data={'msg':'Error adding user: ' + err};
               res.send(data);
            } else {
                getUserInfo(res,collection,email,pwd);
          //      data={'msg':'success'};
            }
            
        });
    });
};
exports.updateUser = function(req, res) {
    var id = req.params.id;
    var user = req.body;
  
    db.collection(userTableName, function(err, collection) {
        var pid = new oID(id);
        collection.update({'_id': pid}, user, {'w':1}, function(err, result) {
            var data={'msg':'error'};
            if (err ) {
                data={'msg':'Error updating user: ' + err};
 
            } else {
   
                data.msg='success';
            }
            res.send(data);
        });
    });
};

exports.deleteUser = function(req, res) {
    var id = req.params.id;

    db.collection(userTableName, function(err, collection) {
        var pid = new oID(id);
 
        collection.remove({'_id':pid}, {'w':1}, function(err, result) {
            var data={'msg':'error'};
            if (err) {
                data={'msg':'Error deleting user: ' + err};
  
            } else {

               data.msg='success';
            }
            res.send(data);
        });
    });
}

// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var users = [
    {
        email: "sandman8654@outlook.com",
	    password:"Shuanxing805",
        firstname: "",
	    lastname: "",
        weight: "",
        age: ""
    }];

    db.collection(userTableName, function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {
		
	   });
    });

};
var populatePromocode = function() {

    var users = [
    {
        code: "gram",
        usage:0
    },{
        code:'facebook',
        usage:0
    }];

    db.collection(promocodeTableName, function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {
        
        });
    });

};

