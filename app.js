//App.js handles all of the middleware
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan'); //Morgan Middleware shows what is happening in the console in the BASH Terminal (like if there is a POST, GET, etc.)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Adding the three new routers that was created in class (routers found in the router folder)
const campsiteRouter= require("./routes/campsiteRouter");
const promotionRouter= require("./routes/promotionRouter");
const partnerRouter= require("./routes/partnerRouter");

//Connecting Express Server to MongoDB and Mongoose (lines 17-32)
//Require Mongoose module
const mongoose= require("mongoose");
//URL for the MongoDB server
const url= "mongodb://localhost:27017/nucampsite";
const connect= mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Handle the Promise to say we correctly connected to the server
//Handle the Promise if we don't correctly connect to the server. If you don't expect to do a Promise chain, you can place a second argument with the error function. 
connect.then(() => console.log("Connected correctly to server"),
  err => console.log(err) //Handles rejected cases. It is more helpful using the .catch() method, but this can also be used to.
); 


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//In this block of code below is our Middleware functions. They run in the position they are in the code (in sequence).
app.use(logger('dev')); //Morgan Logger: logs information in the console
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//Authentification Middleware will be placed before the Express.static() middleware so that users have to authenticate their credentials before accessing the Express server.
//auth function, like all Express middleware functions, has the req, res, next (optional) paremeter
function auth(req, res, next) {
  console.log(req.headers);
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
  const user= auth[0]; //Getting the client's username from the auth array
  const pass = auth[1]; //Getting the client's password from the auth array
  
  //Basic Validation 
  if(user ==="admin" && pass ==="password") {
    return next(); //The user is authorized to use the server
  } else { //An error shows if the user doesn't type admin and password for the username and password
      const err = new Error("You are not authenticated!"); //Goes to the Express error handler
      res.setHeader("WWW-Authenticate", "Basic");
      err.status= 401;
      return next(err);
  }
}
app.use(auth); //Lets the auth middleware function run before the Express.static() middleware function. auth function makes sure that the user has inputted their credentials (authetnication)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//Add the calls for the three routers, this will be used to call the routes on Postman using "http://localhost:3000/campsites"
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
