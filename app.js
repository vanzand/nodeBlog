
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var user = require('./modules/user');
var setting = require('./setting');
var MongoStore = require('connect-mongo')(express);
var flash = require('connect-flash');
var User = require('./modules/user.js');
var crypto = require('crypto');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());	
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret : setting.cookieSecret,
	key : setting.db,
	cookie : {maxAge : 1000 * 60 * 24 * 7},
	store : new MongoStore({
		db : setting.db
	})
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  //看是否已经初始化管理员，若未初始化则进行初始化操作
  User.get('admin', function (err, user){
  	if(user){
  		//admin用户已经存在，无需创建
  		return;
  	}
  	//admin用户还不存在，需要创建
  	var md5 = crypto.createHash('md5');
  	var adminUser = new User({
  		name : 'admin',
  		password : md5.update('admin').digest('hex'),
  		email : ''
  	});
  	adminUser.save(function(err, user){
  		if(err){
  			req.flash('error', '创建管理员账户失败');
  			return res.redirect('/');
  		}
  		console.log('创建管理员账户成功！');
  	});
  })
});
