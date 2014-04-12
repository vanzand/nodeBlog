var crypto = require('crypto');
var db = require('./db');

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
	//打开数据库
	db.open(function (err, db){
		if(err){
			return callback(err);
		}
		//读取user集合
		db.collection('users', function (err, collection){
			if(err){
				db.close();
				return callback(err);
			}
			//将用户插入到users集合中
			collection.insert(user, {
				safe : true
			}, function (err, user){
				db.close();
				if(err){
					return callback(err);
				}
				callback(null, user[0]);
			});
		})
	});
}

User.get = function(name, callback){
	//打开数据库
	db.open(function (err, db){
		if(err){
			return callback(err);
		}
		//读取user集合
		db.collection('users', function (err, collection){
			if(err){
				db.close();
				return callback(err);
			}
			//查找对应用户
			collection.findOne({
				name : name
			}, function (err, user){
				db.close();
				if(err){
					return callback(err);
				}
				callback(null, user);
			});
		})
	});
}

User.getAll = function(callback){
	//打开数据库
	db.open(function (err, db){
		if(err){
			return callback(err);
		}
		//读取user集合
		db.collection('users', function (err, collection){
			if(err){
				db.close();
				return callback(err);
			}
			collection.find().sort({
				name : -1
			}).toArray(function (err, users){
				db.close();
				if(err){
					return callback(err);
				}
				return callback(null, users);
			});
		});
	});
}

User.update = function(user, callback){
	//打开数据库
	db.open(function (err, db){
		if(err){
			return callback(err);
		}
		//读取user集合
		db.collection('users', function (err, collection){
			if(err){
				db.close();
				return callback(err);
			}
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
			collection.update({
				name : user.name
			}, {
				$set : updateObj
			}, function (err){
				db.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
}

module.exports = User;