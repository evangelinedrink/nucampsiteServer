const passport= require("passport");
const LocalStrategy= require("passport-local").Strategy;
const User= require("./models/user");

//The code below will authenticate the client's username and password by using the LocalStrategy and the User.authenticate() methods
exports.local= passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //Serialization: Take the data and then store it 
passport.deserializeUser(User.deserializeUser()); //De-Serialization