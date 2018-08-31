var express = require('express');
var router = express.Router();
var db = require('../DB/db');  //require的路径是我们的db模块相对于本文件的路径
var svgCaptcha = require('svg-captcha');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
app.use(cookieParser());
app.use(session({
    secret: '123456',
    name: 'name',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: true,
}));
router.post('/', function(req, res, next) {
    db.query('select * from user', [], function(results,fields){
        if(req.body.username != results[0].name){
            res.send(
                {message: '账号或者密码错误！'}
            )
        }else{
            if(req.body.password != results[0].passwd ){
                res.send(
                    {message: '账号或者密码错误！'}
                )
            }else{
                res.send(
                    {message: '成功'}
                )
            }
        }
    })
});
// 生成验证码
router.get('/captcha', function(req, res, next){
    var codeConfig = {
        size: 5,// 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        height: 44
    }
    var captcha = svgCaptcha.create(codeConfig);
    req.cookies.captcha = captcha.text.toLowerCase(); //存cookit用于验证接口获取文字码
    var codeData = {
        img:captcha.data
    }
    res.send(codeData);
});



module.exports = router;
