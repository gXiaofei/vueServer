var express = require('express');
var router = express.Router();
var db = require('../DB/db');  //require的路径是我们的db模块相对于本文件的路径
var svgCaptcha = require('svg-captcha');
var nodemailer = require('nodemailer');
var _ = require('lodash');
var config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: '15180000696@163.com',
        pass: 'asx111111'
    }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);

router.post('/', function(req, res, next) {
    var flag = true;
    if(req.body.isSubmitErr){
        var captcha = req.body.captcha;
        if(req.body.captcha){
           captcha = req.body.captcha.toLowerCase()
        }
        if(captcha === req.session.captcha){
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
    req.session.captcha = captcha.text.toLowerCase(); //存cookit用于验证接口获取文字码
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

// 发送邮件获取验证码
router.post('/email', function(req, res, next){
    db.query("select email from user where username='"+ req.body.username+"'", [], function(result, fields){
        if(result.length === 0){
            res.send({
                status: 0,
                message: '账户或者邮箱不正确'
            })
        }else{
            if(result[0].email === req.body.email){
                var data = ['1','2','3','4','5','6','7','8','9','0'];
                var captcha = _.sampleSize(data, 4);
                console.log(captcha.join(''));
                req.session.emailCaptcha = captcha.join('');
                var options = {
                    from: '"gXiaofei" <15180000696@163.com>',
                    to: '"'+req.body.username+'" <'+req.body.email+'>',//可一个或多个以,区分
                    subject: '修改密码',
                    text: '修改密码: 邮箱验证码',
                    html: '<h1>你好，'+req.body.username+'</h1><div>验证码为<b>'+captcha.join('')+'</b></div>',
                };
                transporter.sendMail(options, function(error, info){
                    if(error) {
                        return console.log(error);
                    }
                    res.send({
                        status: 1,
                        message: '验证成功'
                    })
                });
            }else{
                res.send({
                    status: 0,
                    message: '账户或者邮箱不正确'
                })
            }
        }
    });
});
// 判断email验证码
router.post('/changeEmailPasswd', function (req, res, next) {
    if(req.body.emailCaptcha === req.session.emailCaptcha){
        res.send({
            status: 1,
            message: '验证成功'
        });
    }else{
        res.send({
            status: 0,
            message: '验证失败'
        })
    }
})
// 修改密码
router.post('/changePasswd', function(req, res, next){
    console.log(req.body.username);
    db.query("select * from user where username='"+req.body.username +"'", [],function (result, fields) {
         if(result[0].password === req.body.password){
            res.send({
                status: 0,
                message: '不能与原来密码相同'
            })
        }else{
            db.query("UPDATE user SET password='"+req.body.password+"' WHERE username='"+req.body.username+"'", [], function(result, fields){
               if(result){
                res.send({
                    status: 1,
                    message: '修改成功'
                })
               }else{
                res.send({
                    status: 0,
                    message: '修改失败'
                })
               }
            })
        }
    })
})



module.exports = router;
