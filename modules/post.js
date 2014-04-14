var db = require('./db.js');
var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;

function Post(name, title, content, tag){
  this.name = name;
  this.title = title;
  this.content = content;
  this.tag = tag;
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
    name : this.name,
    title : this.title,
    content : this.content,
    tag : this.tag,
    time : time
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
            callback(err);  
          }
          posts.forEach(function(post){
            post.content = markdown.toHTML(post.content);
            //获取文章的摘要
            post.excerpt = post.content.substr(0, 500);
            var lastP = post.excerpt.lastIndexOf('</p>');
            post.excerpt = post.excerpt.substr(0, lastP);
          });
          callback(null, posts, total);
        })
      });
    });
  });
}

Post.getOne = function(_id, callback){
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
        db.close();
        if(err){
          return callback(err);
        }
        post.content = markdown.toHTML(post.content);
        callback(null, post);
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

module.exports = Post;