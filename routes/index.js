var crypto =  require('crypto');
var User = require('../modules/user.js');

module.exports = function(app){
  app.get('/', function (req, res){
    res.render('index', {
      title:'范子冬的个人博客',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

  app.get('/login', function (req, res){
    res.render('login', {
      title:'登录',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });

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

  app.get('/management', function (req, res){
    res.render('management', {
      title : '管理',
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  })
}