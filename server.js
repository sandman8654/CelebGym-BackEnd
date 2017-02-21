var express = require('express'),
    user = require('./routes/users');
	
var app = express();

app.configure(function(){
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
})
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
})
app.get('/users',user.findAll);
app.post('/users',user.addUser);
app.post('/forgot',user.changePassword);
app.post('/confirmuser',user.confirmUser);
app.get('/incpcode/:id', user.increaseUsagePromocode);
app.put('/users/:id',user.updateUser);
app.delete('/users/:id',user.deleteUser);
app.listen(3000);
console.log('Listening on port 3000...');