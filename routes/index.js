module.exports = function(app){
  app.get('/', function (req, res){
    res.render('index', {title:'范子冬的个人博客'});
  });

  app.get('/login', function (req, res){
    res.render('login', {title:'登录'});
  });

  app.post('/login', function (req, res){
    console.log('111111');
    //获取用户名和密码
    var username = req.body.username,
      password = req.body.password;
    console.log("username:"+username+"; password:"+password);
    res.render('login', {title:'登录'});
  });
}