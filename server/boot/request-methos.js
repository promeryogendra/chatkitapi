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
  app.post('/api/confirmRequest' , (req , res) => {
    let requestId = req.body.requestId;
    if(requestId && requestId !== '')
    {
      var Friends = app.models.Friends;
      var Requests = app.models.Requests;
      let filters =
        {
          where:{id:requestId}
        }
      Requests.find( filters , function (err, request) {
        if (err) {
          createResponse(res , 500 , "Server having issue..." , "Error" , 500)
          res.send("Server issue...");
        }else if (!request) {
          createResponse(res , 204 , "No Request Found..." , 'Success' , 204);
          res.send("Request not found...");
        } else {
					Requests.destroyById(requestId , function(err , result) {
						if(err) {
          		createResponse(res , 500 , "Server having issue..." , "Error" , 500);
							res.send("Server Issue...");
						} else {
							let friend = {
							    "user1": request[0].user1,
									"user1username": request[0].user1username,
									"user1email": request[0].user1email,
									"user2": request[0].user2,
									"user2username": request[0].user2username,
									"user2email": request[0].user2email,
									"user1Count": 0,
									"user1Status": "seen",
									"user2Count": 0,
									"user2Status": "seen",
							}
							Friends.create(friend,function(err,data) {
								if(err) {
									createResponse(res , 500 , "Server having issue..." , "Error" , 500);
									res.send("Server Issue...");
								} else {
									createResponse(res , 200 , "Request Confirmed..." , "Success" , 200);
									res.send(data);
								}
							})
						}
					})
        }
      });
    } else {
      createResponse(res , 400 , "parameters missing.." , "Error" , 400)
      res.send("Data required to perform Action...");
    }
  });
	app.post('/api/createRequest' , (req , res) => {
		let user1 = req.body.user1;
    let user1Id = user1.id;
		let user2email = req.body.user2email;
    if(user1 && user1Id && user1Id !== '' && user2email && user2email !== '')
    {
      var Friends = app.models.Friends;
			var Customer = app.models.Customer;
      var Requests = app.models.Requests;
			let filters = {
				where : {email : user2email , emailVerified : true}
			}
			Customer.find(filters , function(err , users) {
				if(err) {
					createResponse(res , 500 , "Server having issue..." , "Error" , 500)
      		res.send("Server issue...");
				} else if(users == undefined || users.length == 0) {
					createResponse(res , 200 , "Email Not found..." , "Success" , 200);
					res.send("USER_NOT_EXISTS");
				} else {
					let user2 = users[0];
					let user2Id = user2.id;
					filters =
						{
							"where":{"and":[{"or":[{"user1": user1Id },{"user2": user2Id}]},{"or":[{"user1": user2Id },{"user2": user1Id}]}]}
						}
					Friends.find( filters , function (err, friend) {
						if(err) {
							createResponse(res , 500 , "Server having issue..." , "Error" , 500)
							res.send("Server issue...");
						} else if( friend == undefined || friend.length ==0 ) {
							Requests.find(filters , function(err, request) {
								if(err) {
									createResponse(res , 500 , "Server having issue..." , "Error" , 500)
									res.send("Server issue...");
								} else if(request == undefined || request.length == 0) {
									let time = ""+new Date().toISOString();
									let request = {
										"user1" : user1.id,
										"user1username": user1.username,
										"user1email" : user1.email,
										"user2" : user2.id,
										"user2username": user2.username,
										"user2email" : user2.email,
										"time": time
									}
									Requests.create(request,function(err,data) {
										if(err) {
											createResponse(res , 500 , "Server having issue..." , "Error" , 500);
											res.send("Server Issue...");
										} else {
											createResponse(res , 200 , "Request Created..." , "Success" , 200);
											res.send(data);
										}
									})
								} else {
									createResponse(res , 200 , "You Already request exits..." , "Success" , 200);
									if(request.user1 === user1Id) {
										res.send("ALREADY_REQUEST_SENDED");
									}else {
										res.send("ALREADY_REQUEST_RECIEVED");
									}
								}
							})
						} else {
							createResponse(res , 200 , "You already friend with that id..." , "Success" , 200);
							res.send("ALREADY_FRIENDS");
						}
					});
				}
			})
		}
	});
  app.use(router);
}

/*
{
    "user1": "5d2c5f9831fcea00177f37e9",
    "user1username": "asd123",
    "user1email": "asd@a",
    "user2": "5d2c618631fcea00177f37ed",
    "user2username": "yogendra",
    "user2email": "yogendra.rgu1@gmail.com",
    "id": "5d58452fbf89eac7e0267c96"
}
 */

//{"where":{"or":[{"and":[{"user1": "5d2c618631fcea00177f37ed"},{"user2": "5d58541f6a207e2a68839ed3"}]},{"and":[{"user1": "5d58541f6a207e2a68839ed3"},{"user2": "5d2c618631fcea00177f37ed"}]}]}}