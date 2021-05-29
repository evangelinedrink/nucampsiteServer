const express = require('express');
const User= require("../models/user"); //Going up one directory, so need to use ../
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Let's a new user register on the website
router.post("/signup", (req, res, next) => {
    //Check to see if username has not already been taken
    User.findOne({username: req.body.username})
    .then(user => {
        if (user) { //If this is truthy, then this means a user document was found with a matching name
          const err= new Error(`User ${req.body.username} already exists!`);
          err.status= 403;
          return next(err);
        } else {
            User.create({ //Create() method returns a promise, so a .then() method will be used to handle the result value from the promise (which is the user document that has been added) 
              username: req.body.username,
              password: req.body.password
            })
            .then(user => {
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json");
                res.json({status: "Resgistration Successful!", user: user});
            })
            .catch(err => next(err)); //Will catch the errors if Promise is not fulfilled
        }
    })
    .catch(err => next(err)); //Chain a catch if the findOne() method returns a rejected promise. A rejected promise from this means that something went wrong with the findOne() method. 
}); 

router.post("/login", (req, res, next) => {
    //Check to see if the user is already logged in (they have been authenticated)
    if (!req.session.user) { //req.session.user is already filled in if there was a cookie with the information already filled in.
      const authHeader= req.headers.authorization;
      if(!authHeader) {//If authHeader is null, this means the user has not placed a username or password in.
        const err= new Error("You are not authenticated!");
        res.setHeader("WWW-Authenticate", "Basic"); //This lets the client know that the server is requesting authentication and the authentication method being requested is Basic 
        err.status= 401; //Error code when authentication is not given
        return next(err); //Server will send the error message back and ask for authentication from the client
      }
      //If the client then gives their username and password, an authorization header will then be submitted to the server
      //Buffer global class in Node is one of the few classes in Node that we can just use.
      //Buffer.from() just decodes the username and password from Base-64 encoded string
      //Argument inside of Buffer.from: It takes the authorization header and extract the username and password from it. Then it places it in the auth array as username and password.
      const auth= Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
      const username= auth[0]; //Getting the client's username from the auth array
      const password= auth[1]; //Getting the client's password from the auth array
   
      //Get the username and password that the client is sending us and check it against the user documents in our database
      User.findOne({username: username})
      .then(user=> {
          if(!user) {
              const err= new Error(`User ${username} does not exist!`);
              err.status= 401;
              return next(err);
          } else if (user.password !== password) {
            const err= new Error("Your password is incorrect!");
            err.status= 401;
            return next(err);
          } else if (user.username=== username && user.password=== password) {
              req.sessions.user= "authenticated";
              res.statusCode= 200;
              res.setHeader("Content-Type", "text/plain");
              res.end("You are authenticated!");
          }
      })
      .catch(err => next(err));
    } else { //If the code goes to the else block, this means that the user is already logged in. Session has already been tracked for this user.
        res.statusCode= 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("You are already authenticated!");
    }
});

//This is for logging out the user. Get() method is used because the client isn't submitting any information to the server, they are just saying I'm logging out.
router.get("/logout", (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie("session-id"); //Clears the cookie that was stored in the client. The name "session-id" was activated in the app.js file
      res.redirect("/"); //Redirects user to the root path, which is local host 3000
  } else { //Client is asking to be logged out without being logged in
      const err= new Error("You are not logged in!");
      err.status= 401;
      return next(err);
  }
})


module.exports = router;
