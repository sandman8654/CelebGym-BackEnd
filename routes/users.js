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
    //var user = req.body;
    console.log('Increasing promocode: ' + id);
    db.collection(promocodeTableName, function(err, collection) {
    //     console.log(collection);
        var pid = new oID(id);
        collection.findOne({'_id': pid},function(err, item) {
            var data={'msg':'error'};
            if (err ) {
                data={'msg':'Error updating code: ' + err};
                console.log('Error updating code ' + err);
                //res.send({'error':'An error has occurred'});
            } else {
               var usage = parseInt(item.usage), temp = {};
               temp['code'] = item.code;
               temp['usage'] = ++usage;
               collection.update({'_id': pid}, temp, {'w':1}, function(err, result) {
                    if (err){

                    }else{
                        console.log('' + result + ' document(s) updated');
                        //res.send(user);
                        data.msg='success';
                    }
                    res.send(data);
               });
            }
        });
    });
}
exports.findAll = function(req, res) {
    db.collection(userTableName, function(err, collection) {
   //      console.log(collection);
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};
var getPromocodes = function(req, res) {
    db.collection(promocodeTableName, function(err, collection) {
    //     console.log(collection);
        collection.find().toArray(function(err, items) {
            console.log(items);
            return items;
        });
    });
    return null;
};
exports.confirmUser = function(req,res){
    var user = req.body;
    console.log('Checking user: ' + JSON.stringify(user));
    var email = user.email, pwd= user.password;
    var resItem ={};
    db.collection(userTableName, function(err, collection) {

         collection.findOne({'email':email}, function(err, item) {
            var data={'msg':'error','item':''};
            if (err ){
                data.msg="Error confirming user: " + err;
                console.log('Error confirming user: ' + err);
            }else{
                if(item==null){
                    data.msg="No existing user. please sign up now.";
                }else{
               //     console.log(item);
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
                // collect promocode data items.
                db.collection(promocodeTableName, function(err, collection) {
                    collection.find().toArray(function(err, items) {
                        resItem['promocodes'] = items;
                        data.item = JSON.stringify(resItem);
                        res.send(data);
                    });
                });  
            }else{
                
                res.send(data);
            }
           
        });
    });
};
exports.addUser = function(req, res) {
    var user = req.body;
    console.log('Adding user: ' + JSON.stringify(user));
    db.collection(userTableName, function(err, collection) {
        collection.insert(user, {safe:true}, function(err, result) {
            var data={'msg':'error'};
            if (err) {
               data={'msg':'Error adding user: ' + err};
               console.log('Error adding user: ' + err);
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                data={'msg':'success'};
            }
            res.send(data);
        });
    });
};
exports.updateUser = function(req, res) {
    var id = req.params.id;
    var user = req.body;
    console.log('Updating user: ' + id);
    console.log(JSON.stringify(user));
 //   console.log(new oID(id));
    db.collection(userTableName, function(err, collection) {
        var pid = new oID(id);
        collection.update({'_id': pid}, user, {'w':1}, function(err, result) {
            var data={'msg':'error'};
            if (err ) {
                data={'msg':'Error updating user: ' + err};
                console.log('Error updating user: ' + err);
                //res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                //res.send(user);
                data.msg='success';
            }
            res.send(data);
        });
    });
}

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
    db.collection(userTableName, function(err, collection) {
        var pid = new oID(id);
        console.log(pid);
        collection.remove({'_id':pid}, {'w':1}, function(err, result) {
            var data={'msg':'error'};
            if (err) {
                data={'msg':'Error deleting user: ' + err};
                console.log('An error has occurred - ' + err);
            } else {
                console.log('' + result + ' document(s) deleted');
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

