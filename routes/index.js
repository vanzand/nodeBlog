var crypto =  require('crypto');
var User = require('../modules/user.js');
var Post = require('../modules/post.js');
var fs = require('fs');

module.exports = function(app){

  app.get('/', function (req, res){
    var page = req.query.p ? parseInt(req.query.p) : 1,
      category = req.query.category || null,
      query = {};

    if(category && category.toLowerCase() != 'null'){
      query.category = category;
    }

    console.log('开始查找文章');
    Post.getTen(query, page, function (err, posts, total){
      if(err){
        posts = [];
      }
      console.log('找到文章'+posts.length+'篇，开始返回');
      res.render('index', {
        title : '范子冬的个人博客',
        posts : posts,
        page : page,
        category : category,
        isFirstPage : page === 1,
        isLastPage : (page - 1) * 10 + posts.length === total,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
      console.log('返回完毕');
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res){
    res.render('login', {
      title:'登录',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res){
    //获取用户名和密码
    var md5 = crypto.createHash('md5');
    var username = req.body.username,
      password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(username, function(err, user){
      if(!user){
        req.flash('error', '该用户不存在');
        console.log('该用户不存在');
        return res.redirect('/login');
      }
      //检查密码是否一致
      console.log(user.password)
      if(password !== user.password){
        req.flash('error', '密码错误');
        console.log('密码错误');
        return res.redirect('/login');
      }
      //用户名和密码均正确
      req.session.user = user;
      req.flash('success', '登录成功！');
      console.log('密码成功');
      res.redirect('/management');
    });
  });

  app.get('/management', checkLogin);
  app.get('/management', function (req, res){
    //admin可以获取所有文章，其余用户可以看到自己的所有文章,每次最多展示10篇
    var page = req.query.p ? parseInt(req.query.p) : 1,
      currentUserName = req.session.user.name,
      query = {};
    if(currentUserName !== 'admin'){
      query.username = currentUserName;
    }
    Post.getTen(query, page, function (err, posts, total){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('management', {
        title:'范子冬的个人博客',
        posts : posts,
        page : page,
        isFirstPage : page === 1,
        isLastPage : (page - 1) * 10 + posts.length === total,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });

  app.get('/management/posts', checkLogin);
  app.get('/management/posts', function (req, res){
    //admin可以获取所有文章，其余用户可以看到自己的所有文章,每次最多展示10篇
    var page = req.query.page ? parseInt(req.query.page) : 1,
      currentUserName = req.session.user.name,
      query = {};
    if(currentUserName !== 'admin'){
      query.username = currentUserName;
    }
    Post.getTen(query, page, function (err, posts, total){
      if(err){
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('posts_management', {
        title:'文章管理',
        posts : posts,
        page : page,
        isFirstPage : page === 1,
        isLastPage : (page - 1) * 10 + posts.length === total,
        totalPage : total/10+1,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });

  app.get('/management/addPost', checkLogin);
  app.get('/management/addPost', function (req, res){
    res.render('addPost', {
      title : '发布文章',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

  app.post('/management/addPost', checkLogin);
  app.post('/management/addPost', function (req, res){
    console.log('开始保存文章');
    console.log(req.body.content);
    var post = {
      username : req.session.user.name,
      title : req.body.title,
      category : req.body.category,
      titleImgPath : '',
      tags : [req.body.tag1, req.body.tag2, req.body.tag3],
      content : req.body.content
    };
    for(var i in req.files){
      if (req.files[i].size == 0){
        // 使用同步方式删除一个文件
        fs.unlinkSync(req.files[i].path);
        console.log('Successfully removed an empty file!');
      } else {
        var target_path = './public/images/' + req.files[i].name;
        // 使用同步方式重命名一个文件
        fs.renameSync(req.files[i].path, target_path);
        console.log('Successfully renamed a file!');
        post.titleImgPath = '/images/' + req.files[i].name;
      }
      break;
    }
    var post = new Post(post);
    post.save(function(err){
      if(err){
        req.flash('error', '发布文章失败！')
        return res.redirect('/management/posts');
      }
      req.flash('success', '发布文章成功!');
      res.redirect('/management/posts');
    });
  });

  app.get('/management/editPost', checkLogin);
  app.get('/management/editPost', function (req, res){
    var postId = req.query._id;
    Post.getOne(postId, false, function (err, post){
      if(err){
        console.log('未找到相应文章');
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('editPost', {
        title : '编辑文章',
        post : post,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    })
  });

  app.post('/management/editPost', checkLogin);
  app.post('/management/editPost', function (req, res){
    //查看题图有没有被修改
    var titleImgPath = null,
      post = {
      title : req.body.title,
      category : req.body.category,
      tags : [req.body.tag1, req.body.tag2, req.body.tag3],
      content : req.body.content
    };
    for(var i in req.files){
      if (req.files[i].size == 0){
        // 使用同步方式删除一个文件
        fs.unlinkSync(req.files[i].path);
        console.log('Successfully removed an empty file!');
      } else {
        var target_path = './public/images/' + req.files[i].name;
        // 使用同步方式重命名一个文件
        fs.renameSync(req.files[i].path, target_path);
        console.log('Successfully renamed a file!');
        titleImgPath = '/images/' + req.files[i].name;
      }
      break;
    }
    if(titleImgPath){
      post.titleImgPath = titleImgPath;
    }
    Post.update(req.body._id, post, function (err){
      if(err){
        console.log(err);
        req.flash('error', '更新文章失败');
        return res.redirect('back');
      }
      res.redirect('/management/p/'+req.body._id);
    });
  });

  app.get('/management/deletePost', function (req, res){
    var postId = req.query._id;
    Post.delete(postId, function (err){
      if(err){
        console.log(err);
        req.flash('error', '删除文章失败！');
        return res.redirect('back');
      }
      res.redirect('/management/posts');
    });
  });

  app.get('/management/p/:_id', checkLogin);
  app.get('/management/p/:_id', function (req, res){
    Post.getOne(req.params._id, true, function (err, post){
      if(err){
        req.flash('error', err);
        return res.redirect('/management/posts');
      }
      req.flash('success', '找到对应文章');
      res.render('post_management', {
        title : post.title,
        user : req.session.user,
        post : post,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res){
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/login');
  });

  app.get('/p/:_id', function (req, res){
    Post.getOne(req.params._id, true, function (err, post){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }
      console.log('找到对应文章');
      req.flash('success', '找到对应文章');
      res.render('article', {
        title : post.title,
        user : req.session.user,
        post : post,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })
    });
  });

  app.get('/about', function (req, res){
    res.render('about', {
      title : '关于我'
    })
  })

  app.get('/setting/baseInfo', checkLogin);
  app.get('/setting/baseInfo', function (req, res){
    res.render('baseInfo', {
      title : '个人资料',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

  app.post('/setting/baseInfo', checkLogin);
  app.post('/setting/baseInfo', function (req, res){
    //目前基本信息修改只涉及到邮箱
    var currentUser = req.session.user,
      email = req.body.email;
    User.update({
      _id : currentUser._id,
      email : email
    }, function (err){
      if(err){
        req.flash('error', '保存基本资料失败！');
        return res.redirect('back');
      }
      currentUser.email = email;
      res.redirect('/setting/baseInfo');
    });
  });

  app.get('/setting/password', checkLogin);
  app.get('/setting/password', function (req, res){
    res.render('password', {
      title : '修改密码',
      user : req.session.user
    });
  });

  app.post('/setting/password', checkLogin);
  app.post('/setting/password', function (req, res){
    var currentUser = req.session.user,
      old_password = req.body.old_password,
      new_password = req.body.new_password,
      confirm_password = req.body.confirm_password,
      md5 = crypto.createHash('md5');
    if(currentUser.password !== md5.update(old_password).digest('hex') ){
      req.flash('error', '用户密码错误！');
      console.log('用户密码错误！');
      return res.redirect('back');
    }
    if(new_password !== confirm_password){
      req.flash('error', '密码输入不一致！');
      return res.redirect('back');
    }
    var new_password_md5 = crypto.createHash('md5').update(new_password).digest('hex');
    User.update({
      _id : currentUser._id,
      password : new_password_md5
    }, function (err){
      if(err){
        req.flash('error', '修改密码失败！');
        console.log('修改密码失败！');
        return res.redirect('back');
      }
      console.log('修改密码成功！');
      currentUser.password = new_password_md5;
      res.redirect('/setting/password');
    });
  });

  app.get('/userList', checkLogin);
  app.get('/userList', function (req, res){
    //获取所有用户
    User.getAll( function (err, users){
      if(err){
        req.flash('error', '获取用户失败！');
        return res.redirect('back');
      }
      res.render('userList',{
        title : '用户管理',
        user : req.session.user,
        users : users,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });

  app.get('/addUser', checkLogin);
  app.get('/addUser', function (req, res){
    res.render('addUser', {
      title : '添加用户',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

  app.post('/addUser', checkLogin);
  app.post('/addUser', function (req, res){
    var username = req.body.username,
      password = req.body.password,
      confirm_password = req.body.confirm_password,
      email = req.body.email;
    //判断该用户是否已经存在
    User.get(username, function (err, user){
      if(user){
        req.flash('error', '该用户名已经被使用');
        return res.redirect('back');
      }
      if(password !== confirm_password){
        req.flash('error', '两次输入密码不一致');
        return res.redirect('back');
      }
      var md5 = crypto.createHash('md5'),
        password_md5 = md5.update(password).digest('hex');
      var newUser = new User({
        name : username,
        password : password_md5,
        email : email
      });
      newUser.save(function (err, user){
        if(err){
          req.flash('error', '添加用户失败！');
          return res.redirect('back');
        }
        req.flash('success', '添加用户成功！')
        res.redirect('/userList');
      });
    })
  });

  app.get('/management/deleteUser', checkLogin);
  app.get('/management/deleteUser', function (req, res){
    var currentUser = req.session.user,
      deleteUserId = req.query._id;
    User.isAdmin(currentUser._id, function(err, isAdmin){
      if(isAdmin){
        User.delete(deleteUserId, function(err){
          if(err){
            req.flash('error', '删除用户失败！');
            return res.redirect('back');
          }
          req.flash('success', '删除用户成功！');
          res.redirect('back');
        });
      }else{
        req.flash('error', '您无权删除用户！');
        return res.redirect('back');
      }
    });
  });

  //当无法匹配路径时，调用404页面
  app.use(function (req, res){
    console.log('未找到相应页面');
    res.render('404');
  });

  function checkLogin(req, res, next){
    if(!req.session.user){
      req.flash('error', '未登录');
      return res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next){
    if(req.session.user){
      req.flash('error', '已登录');
      return res.redirect('back');
    }
    next();
  }
}