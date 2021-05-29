const passport= require("passport");
const LocalStrategy= require("passport-local").Strategy;
const User= require("./models/user");
const JwtStrategy= require("passport-jwt").Strategy; //Import JWTStrategy
const ExtractJwt= require("passport-jwt").ExtractJwt;
const jwt= require("jsonwebtoken"); //Used to create, sign and verify tokens

const config= require("./config.js");

//The code below will authenticate the client's username and password by using the LocalStrategy and the User.authenticate() methods
exports.local= passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //Serialization: Take the data and then store it 
passport.deserializeUser(User.deserializeUser()); //De-Serialization

//This is for a user document that will return a Token.
exports.getToken= function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600}); //Creates a Token. Sign() method is a part of JSON Web Token will take user object (first argument),  user key string (second argument), configure the token to expire in 3600 seconds, in one hour (third argument). If you don't have hte expiresIn, the token will never expire.
};

//Configure JSON Web Token Strategy for Passport
const opts= {}; //Contains the options for the JSON Web Token Strategies. Initialized as an empty object
opts.jwtFromRequest= ExtractJwt.fromAuthHeaderAsBearerToken(); //For this, ExtractJwt object and one of its methods fromAuthHeaderAsBearerToken. This option specifies how the JSON Web Token should be extracted from the incoming request message. JSON web token can be sent as a request header, request body or even as an URL query parameter.  This option will ask for the token to be in the authorization header.  This is the simplest method for sending a JSON Web Token.
opts.secretOrKey= config.secretKey; //This option lets us supply the JSON Web Token with a key with which we will assign this token

//Export the JSON Web Token (JWT) Strategy with Passport 
exports.jwtPassport= passport.use(
    new JwtStrategy(
        opts, //Object with configuration options. We created this, it is named opts.
        (jwt_payload, done) => { //Verify callback function 
            console.log("JWT payload: ", jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user); //done() callback is a function that is written in the Passport-JWT Module, don't need to write it ourselves.
                } else { //If we get to this else block, it means there were no errors and no user document was found that matched in the token 
                    return done(null, false); //There was no error, but false because there was no user found.
                }
            });
        }
    )
);

//Creating verifyAdmin() function
exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin===true) { //Passport has loaded a user property to the req object. We want to make sure that the user is an admin, that admin: true in user.js. Syntax is based off of req.body.firstname in users.js file.
        return next();
    } else { //If the user is not an admin, it will display an error
        const err= new Error("You are not authorized to perform this operation!");
        err.status= 403;
        return next(err);
    }
};

exports.verifyUser= passport.authenticate("jwt", {session: false}); //Verifying incoming request is comving from a verified user.

