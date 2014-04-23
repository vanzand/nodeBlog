var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  username : String,
  title : String,
  category : String,
  titleImgPath : String,
  content : String,
  tags : Array,
  time : Object,
  pv : Number
});

var postModel = mongoose.model('Post', postSchema);

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
  }, newPost = new postModel(post);

  newPost.save(function (err, post){
    if(err){
      return callback(err);
    }
    callback(null);
  });
}

Post.getTen = function(query, page, callback){
  postModel.count(query, function (err, total){
    if(err){
      return callback(err);
    }
    postModel.find(query, null, {
      skip : (page-1) * 10,
      limit : 10
    }, function (err, posts){
      if(err){
        return callback(err);
      }
      posts.forEach(function(post){
        //post.content = markdown.toHTML(post.content);
        //获取文章的摘要
        post.excerpt = '';
        if(post.content){
          post.excerpt = post.content.substr(0, 500);
        }
        //var lastP = post.excerpt.lastIndexOf('</p>');
        //post.excerpt = post.excerpt.substr(0, lastP);
      });
      return callback(null, posts, total);
    });
  });
}

Post.getOne = function(_id, changeToHtml, callback){
  postModel.findById(_id, function (err, post){
    if(err){
      return callback(err);
    }
    if(post){
      postModel.findByIdAndUpdate(_id, {
        $inc: {"pv": 1}
      }, function(err){

      });
      /*if(changeToHtml===true){
        post.content = markdown.toHTML(post.content);
      }*/
      callback(null, post);
    }else{
      callback(null, post);
    }
  });
}

Post.update = function(_id, post, callback){
  postModel.findByIdAndUpdate(_id, {
    $set : post
  }, function(err){
    if(err){
      return callback(err);
    }
    return callback(null);
  });
}

Post.delete = function(_id, callback){
  postModel.findByIdAndRemove(_id, function(err){
    if(err){
      return  callback(err);
    }
    console.log('删除成功');
    callback(null);
  });
}

module.exports = Post;