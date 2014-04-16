var db = require('./db.js');
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;

function Post(post){
  this.username = post.username;
  this.title = post.title;
  this.category = post.category;
  this.titleImgPath = post.titleImgPath;
  this.content = post.content;
  this.tags = post.tags;
  this.pv = post.pv || 0;
}

Post.prototype.save = function(callback){
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year : date.getFullYear(),
    month : date.getFullYear() + "-" + (date.getMonth() + 1),
    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  };
  //要存入数据库的文档
  var post = {
    username : this.username,
    title : this.title,
    category : this.category,
    titleImgPath : this.titleImgPath,
    content : this.content,
    tags : this.tags,
    time : time,
    pv : 0
  };
  //打开数据库
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    //查找文章集合
    db.collection('posts', function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      //将文章插入post集合
      collection.insert(post, {
        safe : true
      }, function (err){
        db.close();
        if(err){
          return callback(err);
        }
        return callback(null);
      });
    });
  });
}

Post.getTen = function(query, page, callback){
  //打开数据库
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    //查找文章集合
    db.collection('posts',  function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      //找到符合条件的文章总数，并找到指定的文章
      collection.count(query, function (err, total){
        if(err){
          db.close();
          return callback(err);
        }
        collection.find(query, {
          skip : (page-1) * 10,
          limit : 10
        }).sort({
          time : -1
        }).toArray(function (err, posts){
          db.close();
          if(err){
            return callback(err);  
          }
          posts.forEach(function(post){
            post.content = markdown.toHTML(post.content);
            //获取文章的摘要
            post.excerpt = post.content.substr(0, 500);
            var lastP = post.excerpt.lastIndexOf('</p>');
            post.excerpt = post.excerpt.substr(0, lastP);
          });
          return callback(null, posts, total);
        })
      });
    });
  });
}

Post.getOne = function(_id, changeToHtml, callback){
  //打开数据库
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    //读取post集合
    db.collection('posts', function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      //找到指定id的文章
      collection.findOne({
        "_id": new ObjectID(_id)
      }, function (err, post){
        if(err){
          db.close();
          return callback(err);
        }
        if(post){
          //每次找到该文章，则加一次pv
          collection.update({
            "_id": new ObjectID(_id)
          }, {
            $inc: {"pv": 1}
          }, function (err){
            db.close();
            if(err){
              return callback(err);
            }
          });
          if(changeToHtml===true){
            post.content = markdown.toHTML(post.content);
          }
          callback(null, post);
        }else{
          callback(null, post);
        }
        
      });
    });
  });
}

Post.get = function (query, callback){
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    db.collection('posts', function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      collection.find(query).sort({
        time : -1
      }).toArray(function (err, posts){
        db.close();
        if(err){
          callback(err);  
        }
        posts.forEach(function(post){
          post.content = markdown.toHTML(post.content);
        });
        callback(null, posts);
      })
    });
  });
}

Post.update = function(_id, post, callback){
  //打开数据库
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    //读取post集合
    db.collection('posts', function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      //更新指定id的文章
      collection.update({
        _id : new ObjectID(_id)
      }, {
        $set : post
      }, function (err){
        db.close();
        if(err){
          return callback(err);
        }
        return callback(null);
      });
    });
  });
}

Post.delete = function(_id, callback){
  console.log('开始删除：' + _id);
  db.open(function (err, db){
    if(err){
      return callback(err);
    }
    db.collection('posts', function (err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      collection.remove({
        _id : new ObjectID(_id)
      }, {
        w :1
      }, function (err){
        db.close();
        if(err){
          return  callback(err);
        }
        console.log('删除成功');
        callback(null);
      });
    });
  });
}

module.exports = Post;