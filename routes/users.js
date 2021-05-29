const express = require('express');
const User= require("../models/user"); //Going up one directory, so need to use ../
const passport= require("passport"); //Importing Passport
const authenticate= require("../authenticate");
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/signup", (req, res) => {
    User.register(
        new User({username: req.body.username}), //the {username: req.body.username} is the username that was given by the client
        req.body.password, //the {password: req.body.password} is the password that was given by the client
        (err, user) =>{ //The second argument contains the user document
            if (err) {
              res.statusCode= 500; //Internal server error
              res.setHeader("Content-Type", "application/json");
              res.json({err:err}); //Gives us information about the error
            } else { //If there was no error
              if(req.body.firstname) { //Check to see if the first name was sent in the request body 
                  user.firstname= req.body.firstname;
              }  
              if (req.body.lastname) { //Check to see if the last name was sent in the request body 
                  user.lastname= req.body.lastname;
              } 
              //Saving the first and last name to the database
              user.save(err => {
                if (err) { // If there is an error
                  res.statusCode= 500;
                  res.setHeader("Content-Type", "application/json");
                  res.json({err: err});
                  return;
                } 
                //If there is no error
                passport.authenticate("local")(req, res, () => {
                  res.statusCode= 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({success: true, status: "Registration Successful!"});
                });
              });  
            }
        }
    );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

/*router.post("/login", passport.authenticate("local"), (req, res) => {
  //Once the user has been authenticated with their username and password, then we will issue a token to the user by using the get.Token() method that is located in the authenticate.js file
  const token= authenticate.getToken({_id: req.user._id});
  //Sent a response to the client if the login was successful
  res.statusCode= 200;
  res.setHeader("Content-Type", "application/json");
  res.json({success: true, token: token, status: "You are successfully logged in!"}); //Once we have the token, we include it in our response to the client by adding a token property to the response (token: token). 
});
*/


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
