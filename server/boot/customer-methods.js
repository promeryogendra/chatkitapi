module.exports = function (app) {
  var router = app.loopback.Router();

  function createResponse(res, status, message, name, code) {
    res.statusCode = status;
    res.status = status;
    res.message = message;
    res.name = name;
    res.code = code;
  }
  //Check the user is authenticated or not
  app.get('/api/verifyUser' , (req , res) => {
    let tokenId = req.body.tokenId;
    let userId = req.body.userId;
    if(tokenId  && userId && tokenId !== '' && userId !== '')
    {
      var Customer = app.models.Customer;
      var AccessToken = app.models.AccessToken;
      AccessToken.resolve(tokenId, (err, accessToken) => {
        if (err) {
          createResponse(res , 500 , "Server having issue..." , "Error" , 500)
          res.send("Server issue...");
        } else if ( ! accessToken) {
          createResponse(res , 204 , "No Content Found..." , 'Success' , 204);
          res.send(false);
        } else {
          Customer.find({where: {id:accessToken.userId}}, function (err, users) {
            if (err) {
              createResponse(res , 500 , "Server having issue..." , "Error" , 500)
              res.send("Server issue...");
            }else if (!users || users === [] ) {
              createResponse(res , 204 , "Not Authenticated user..." , 'Success' , 204);
              res.send(false);
            } else {
              if(users[0].id+"" === userId) {
                createResponse(res , 200 , "Authenticated user..." , "Success" , 200);
                res.send(true);
              } else {
                createResponse(res , 204 , "Not Authenticated user..." , "Success" , 204);
                res.send(false);
              }
            }
          });
        }
      });
    } else {
      createResponse(res , 400 , "parameters missing.." , "Error" , 400)
      res.send("Data required to perform Action...");
    }
  });
  //Check user Email or Username exists or not
  app.get('/api/check' , (req , res) => {
    let checkName = req.body.checkName;
    var Customer = app.models.Customer;
    if(checkName != undefined && checkName !== '') {
      let username ;
      if(checkName === 'username') username = req.body.username;
      let email;
      if(checkName === 'email')  email = req.body.email;
      let filters;
      let letsCheck = false;
      if(checkName === 'email' && email !=undefined && email !== '') {
        filters = {
          where : {  "email" : email}
        }
        letsCheck = true;
      } else if( checkName === 'username' && username != undefined && username !== '') {
        filters = {
          where : { "username" : username}
        }
        letsCheck = true;
      }
      if(letsCheck) {
        Customer.findOne(filters , (err , user) => {
           if (err) {
            createResponse(res , 500 , "Server having issue..." , "Error" , 500)
            res.send("Server issue...");
          } else if (!user) {
            createResponse(res , 204 , checkName+" not exists." , "Success" , 204);
            res.send(false);
          } else {
            createResponse(res , 200 , checkName+" Exists..." , "Success" , 200);
            res.send(true);
          }
        })
      } else {
        createResponse(res , 400 , "parameters missing.." , "Error" , 400)
        res.send("Data required to perform Action...");
      }
    } else {
      createResponse(res , 400 , "parameters missing.." , "Error" , 400)
      res.send("Data required to perform Action...");
    }
  });
  app.use(router);
}