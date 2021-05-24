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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
