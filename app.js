//App.js handles all of the middleware
var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser'); //Middleware of Cookie-Parser
var logger = require('morgan'); //Morgan Middleware shows what is happening in the console in the BASH Terminal (like if there is a POST, GET, etc.)
const session= require("express-session");//Importing Express Session
const FileStore= require("session-file-store")(session);//Importing File Store. There are 2 sets of parameters after a function call like this. JavaScript can return another function. Require function is returning another function as its return value. Then we call the return function with the second parameter list (the second argument is "session")

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
//Can't use Cookie-Parser and Express Session together because Express Session has its own cookies.
//app.use(cookieParser("12345-67890-09876-54321")); //Cookie Parser is set up here to be used.  The secret key for the cookie parser is placed inside of the parenthesis. Secret key doesn't have to be meaningful, it is a key that is sent to the cookie parser that will encrypt the information.

//Express Session Middleware
app.use(session({
  name: "session-id",
  secret: "12345-67890-09876-54321",
  saveUninitialized: false, //When a new session is created, but no updates are made to it, then at the end of the request it won't get saved. No cookie will be sent to the client.
  resave: false, //Once session has been created, updated and saved, it will continue to be re-saved even when the request didn't make any updates to be saved. This will make the session active, so it doesn't get deleted when the user is making requests.
  store: new FileStore(),//Create a new file store as an object that we cna use to save our session information to the server's hard disk instead of the applicaiton's memory.
}))

//These two lines of code are placed before the auth function because we want user to login before everything else.
app.use('/', indexRouter);
app.use('/users', usersRouter);

//Authentification Middleware will be placed before the Express.static() middleware so that users have to authenticate their credentials before accessing the Express server.
//auth function, like all Express middleware functions, has the req, res, next (optional) paremeter
function auth(req, res, next) {
  
  //The Session middleware wil automatically add a property called "session" to the request message.  We will see what it contains in the line below by console logging that property of req.session.
  console.log(req.session);
  
  //console.log(req.headers); //This console logs the request header
  
  //If request does not contained the signed cookie nor its value, it will be parsed as false. This means the user has not authenticated their username and password.
  //if(!req.signedCookies.user) { //signedCookies property of the request object is provided by the cookie parser. It will automatically parse a signed cookie from the request. If the cookie is not properly signed, it will return a value of False. The user property is something that will be added to the signed cookie.
  
  
  if(!req.session.user) { //Checking to see if the client is not authenticated
      const err= new Error("You are not authenticated!");
      err.status= 401; //Error code when authentication is not given
      return next(err); //Server will send the error message back and ask for authentication from the client
  } else { //If there is a signed cookie in the incoming request
    if(req.session.user ==="authenticated") { //If this is true, grant access to the client to the next middleware function
      return next();//Going to the next middleware function
    } else {
        const err = new Error("You are not authenticated!"); //Goes to the Express error handler
        err.status= 401;
        return next(err);
    }
  }
}

app.use(auth); //Lets the auth middleware function run before the Express.static() middleware function. auth function makes sure that the user has inputted their credentials (authetnication)
app.use(express.static(path.join(__dirname, 'public')));


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
