
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
var fs = require('fs');
//日志文件
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());	
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
app.use(express.session({
	secret : setting.cookieSecret,
	key : setting.db,
	cookie : {maxAge : 60000 * 60 * 24 * 7},
	url : setting.url
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  mongoose.connect(setting.url);
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
