var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  head: String
}, {
  collection: 'users' 
});

var userModel = mongoose.model('User', userSchema);

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

User.prototype.save = function(callback){
	// 生成密码的MD5码
	var md5 = crypto.createHash('md5'),
		email_md5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "http://www.gravatar.com/avatar/" + email_md5 + "?s=48";
	var user = {
		name : this.name,
		password : this.password,
		email : this.email,
		head : head
	};
	var newUser = new userModel(user);
	newUser.save(function(err, user){
		if(err){
			return callback(err);
		}
		callback(null, user);
	});
}

User.get = function(name, callback){
	userModel.findOne({
		name : name
	}, function (err, user){
		if(err){
			return callback(err);
		}
		callback(null, user);
	});
}

User.getAll = function(callback){
	console.log('开始获取所有用户');
	userModel.find(null, function(err, users){
		console.log('获取所有用户成功');
		if(err){
			return callback(err);
		}
		return callback(null, users);
	});
}

User.update = function(user, callback){
	//更新相应用户的基本信息
	var md5 = crypto.createHash('md5');
	var updateObj = {};
	if(user.email){
		updateObj.email = user.email;
		updateObj.head = "http://www.gravatar.com/avatar/" + md5.update(user.email.toLowerCase()).digest('hex') + "?s=48"
	}
	if(user.password){
		updateObj.password = user.password;
	}
	console.log(updateObj);
	userModel.update({
		_id : user._id
	}, {
		$set : updateObj
	}, function (err, user){
		if(err){
			return callback(err);
		}
		callback(null);
	});
}

User.isAdmin = function(_id, callback){
	//打开数据库
	userModel.findOne({
		_id : new ObjectID(_id)
	}, function(err, user){
		if(err){
			return callback(err, false);
		}
		if(user && user.name==='admin'){
			return callback(null, true);
		}else{
			return callback(null, false);
		}
	});
}

User.delete = function(_id, callback){
	userModel.findByIdAndRemove(new ObjectID(_id), function (err){
		if(err){
			return callback(err);
		}
		console.log('删除成功');
    callback(null);
	});
}

module.exports = User;