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
  app.get('/api/initial' , (req , res) => {
    let userId = req.body.userId;
    if(userId && userId !== '')
    {
      var Friends = app.models.Friends;
      let filters =
        {
          "where":{"or":[{"user1": userId },{"user2": userId}]},
          "include": { "relation": "messages","scope": { "order":"date DESC" }}
        }
      Friends.find( filters , function (err, users) {
        if (err) {
          createResponse(res , 500 , "Server having issue..." , "Error" , 500)
          res.send("Server issue...");
        }else if (!users) {
          createResponse(res , 204 , "Not Authenticated user..." , 'Success' , 204);
          res.send(false);
        } else {
          if(users) {
            createResponse(res , 200 , "Authenticated user..." , "Success" , 200);
            res.send(users);
          } else {
            createResponse(res , 204 , "Not Authenticated user..." , "Success" , 204);
            res.send(false);
          }
        }
      });
    } else {
      createResponse(res , 400 , "parameters missing.." , "Error" , 400)
      res.send("Data required to perform Action...");
    }
  });
  app.post('/api/updateMessageCount' , (req , res) => {
    let friendsId = req.body.friendsId;
    let userId = req.body.userId;
    let countStatus = req.body.countStatus;
    if(userId && friendsId && countStatus &&  friendsId !== '' && userId !== '' && countStatus != '')
    {
      var Friends = app.models.Friends;
      let filters =
        {
          "where":{id : friendsId ,"or":[{"user1": userId },{"user2": userId}]}
        }
      Friends.findOne( filters , function (err, user) {
        if (err) {
          createResponse(res , 500 , "Server having issue..." , "Error" , 500)
          res.send("Server issue...");
        }else if (!user || user === [] ) {
          createResponse(res , 204 , "No User Found data..." , 'Success' , 204);
          res.send(false);
        } else {
          if(user) {
            if(user.user1 === userId) {
              if(countStatus === 'seen') {
                user.user1Count = 0;
                user.user1Status = "seen";
              }else if(countStatus === 'notseen') {
                user.user1Count = Number(user.user1Count)+1;
                user.user1Status = "notseen";
              }
            }else if(user.user2 === userId) {
              if(countStatus === 'seen') {
                user.user2Count = 0;
                user.user2Status = "seen";
              }else if(countStatus === 'notseen') {
                user.user2Count = Number(user.user2Count)+1;
                user.user2Status = "notseen";
              }
            }
            user.save(function (err , updatedUser) {
              if(err) {
                createResponse(res , 500 , "Server having issue..." , "Error" , 500)
                res.send("Server issue...");
              } else {
                createResponse(res , 200 , "User Updated..." , "Success" , 200);
                res.send(updatedUser);
              }
            })
          } else {
            createResponse(res , 204 , "Not Authenticated user..." , "Success" , 204);
            res.send(false);
          }
        }
      });
    } else {
      createResponse(res , 400 , "parameters missing.." , "Error" , 400)
      res.send("Data required to perform Action...");
    }
  });
  app.use(router);
}
