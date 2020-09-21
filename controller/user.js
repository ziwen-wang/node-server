//引入db配置
const db = require('../config/db')

//引入sequelize对象
const Sequelize = db.sequelize

//引入数据表模型
const user = Sequelize.import('../module/user')

//引入jwt做token验证
const jwt = require('jsonwebtoken')
//解析token
const tools = require('../public/tools')
//统一设置token有效时间  为了方便观察，设为10s
const expireTime = '10s'
//自动创建表
user.sync({ force: false });

//数据库操作类
class userModule {
    static async userRegist(data) {
        return await user.create({
            password: data.password,
            userName: data.userName
        })
    }

    static async getUserInfo(userName) {
        return await user.findOne({
            where: {
                userName
            }
        })
    }
}
//功能处理
class userController {
    //注册用户
    static async create(ctx) {
        const req = ctx.request.body;
        if (req.userName && req.password) {
            try {
                const query = await userModule.getUserInfo(req.userName);
                if (query) {
                    ctx.response.status = 200;
                    ctx.body = {
                        code: -1,
                        desc: '用户已存在'
                    }
                } else {
                    const param = {
                        password: req.password,
                        userName: req.userName
                    }
                    const data = await userModule.userRegist(param);

                    ctx.response.status = 200;
                    ctx.body = {
                        code: 0,
                        desc: '用户注册成功',
                        userInfo: {
                            userName: req.userName
                        }
                    }
                }

            } catch (error) {
                ctx.response.status = 416;
                ctx.body = {
                    code: -1,
                    desc: '参数不齐全'
                }
            }
        }
    }
    //获取用户信息(除密码外)
    static async getUserInfo(ctx){
        const req = ctx.request.body;
        const token = ctx.headers.authorization;
        console.log(token)
        if(token){
            try {
                const result = await tools.verToken(token);
                if (!req.userName) {
                    return ctx.body = {
                        code: '-1',
                        desc: '参数错误'
                    }
                } else {
                    let data = await userModule.getUserInfo(req.userName);
                    console.log('dsadadsssssssssss',data)
                    if (req.userName == data.userName) {
                        const info = {
                            userName: data.userName,
                            id: data.id
                        };
                        return ctx.body = {
                            code: '0',
                            userInfo: JSON.stringify(info),
                            desc: '获取用户信息成功'
                        }
                    }
                }
            } catch (error) {
                ctx.status = 401;
                return ctx.body = {
                    code: '-1',
                    desc: '登陆过期，请重新登陆'
                }
            }
        }else{
            ctx.status = 401;
            return ctx.body = {
                code: '-1',
                desc: '登陆过期，请重新登陆'
            }
        }
    }
    //登录
    static async login(ctx) {
        const req = ctx.request.body;
        console.log('req.password=',req);
        console.log('req.userName=',req.userName);
        if (!req.userName || !req.password) {
            return ctx.body = {
                code: '-1',
                msg: '用户名或密码不能为空'
            }
        } else {
            const data = await userModule.getUserInfo(req.userName);
            console.log('******',data)
            if (data) {
                console.log('data.password = ',data.password);
                console.log('req.password = ',req.password);
                if (data.password === req.password) {
                    //生成token，验证登录有效期
                    const token = jwt.sign({
                        user: req.userName,
                        password: req.password
                    }, '123456', { expiresIn: expireTime });
                    const info = {
                        userName: data.userName,
                        id: data.id
                    }
                    return ctx.body = {
                        code: '0',
                        token: token,
                        userInfo: JSON.stringify(info),
                        desc: '登陆成功'
                    }
                } else {
                    return ctx.body = {
                        code: '-1',
                        desc: '用户密码错误'
                    }
                }
            } else {
                return ctx.body = {
                    code: '-1',
                    desc: '该用户尚未注册'
                }
            }
        };
    }
}

module.exports = userController