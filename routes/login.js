var express = require('express');
var router = express.Router();
var db = require('../DB/db');  //require的路径是我们的db模块相对于本文件的路径
var svgCaptcha = require('svg-captcha');

router.post('/', function(req, res, next) {
    var flag = true;
    if(req.body.isSubmitErr){
        console.log(req.body.captcha);
        console.log( req.session.captcha);
        if(req.body.captcha === req.session.captcha){
            flag = true
        }else{
            flag = false
            res.send({
                status: 0,
                message: '验证码不正确'
            });
        }
    }else{
        flag = true
    }
    if(flag){
        db.query("select * from user where username='"+ req.body.username+"'", [], function(results,fields){
            if(results.length === 0){
                res.send({
                    status: 0,
                    message: '账户或者密码不正确'
                });
            }else{
                if(req.body.password === results[0].password){
                    res.send({
                        status: 1,
                        message: '登陆成功'
                    });
                }else{
                    res.send({
                        status: 0,
                        message: '账户或者密码不正确'
                    });
                }
            }
        })
    }
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
    console.log(req.session.captcha);
    req.session.captcha = captcha.text.toLowerCase(); //存cookit用于验证接口获取文字码
    console.log(req.session.captcha);
    var codeData = {
        img:captcha.data
    }
    res.send(codeData);
});
// 获取账号是否被注册
router.post('/getUsername', function (req, res, next) {
    db.query("select username from user where username='"+req.body.username+"'", [], function(result, fields){
        if(result.length !== 0){
            res.send({
                message: 0
            })
        }else{
            res.send({
                message: 1
            })
        }
    })
});
// 注册
router.post('/register', function(req, res, next){

    var data = ([req.body.name, req.body.password, req.body.email])
    db.query('INSERT INTO user(username,password,email) VALUES(?,?,?)', data, function(result, fields){
        if(result){
            res.send({
                message: 1
            });
        }else{
            res.send({
                message: 0
            });
        }
    });
});


module.exports = router;
