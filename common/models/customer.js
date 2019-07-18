'use strict';

var app = require('../../server/server.js');

let data_config = require('../../server/data/email-host-config.json');
let path = require('path');

let senderAddress = data_config.hostmail;


module.exports = function(Customer) {
	
  //Create error
  function createError(status,msg,code) {
    let error = new Error();
    error.status=status;
    error.statusCode = status;
    error.stack = status;
		error.message = msg;
		error.code = code;
    return error;
  }
  //find the user has the data or not
  Customer.beforeRemote('create', function(context, modelInstance, next) {
    let username = context.req.body.username;
    let password = context.req.body.password;
    let email = context.req.body.email;
    if(username !=undefined && username.length < 6) {
			next(createError(400 , "Username length must be atleast 6 chars.","USERNAME_LENGTH"));
		} else if(password != undefined && password.length < 6) {
			next(createError(400 , "Password length must be atleast 6 chars.","PASSWORD_LENGTH"));
		} else {
      context.req.body = {
        "username" : username,
        "email" : email,
        "password": password
      }
      next();
    }
  });
  //After remote hook for create method
  Customer.afterRemote('create', function(context, user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: senderAddress,
			host: data_config.hostaddress,
			port: data_config.port,
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: 'https://chatkitweb.herokuapp.com/',
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) {
        Customer.deleteById(user.id);
        return next(err);
      }
			next();
    });
  });
  //AfterremoteError
  Customer.afterRemoteError('create', function(context, next) {
    // console.log(context,context.error,context.error.status,context.error.code);
    next();
  });

  //Login remote method
  Customer.afterRemote('login', function (ctx, result, next) {
    Customer.findOne({where : {id:result.userId}} , (err , user) => {
      if(err) {
        next(createError(500,"Server error.","SERVER_ERROR"));
      } else if( !user ) {
        next(createError(200 , "User not found" , "USER_NOT_FOUND"));
      } else {
        ctx.result = {
          id: result.id,
          userId: result.userId,
          username: user.username,
          email: user.email
        };
        next();
      }
    })
  });
};
