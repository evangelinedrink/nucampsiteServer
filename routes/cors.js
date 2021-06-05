const cors= require("cors"); //Importing Cors

//Setting up whitelist as an array of string values
const whitelist= ["http://localhost:3000", "https://localhost:3443"]; //You also don’t have to use a wildcard value, you can set up a whitelist of origins to accept.
const corsOptionsDelegate= (req, callback) => { //
    let corsOptions;
    console.log(req.header("Origin"));  //Display the req header that is named Origin
    if (whitelist.indexOf(req.header("Origin")) !== -1) {  //indexOf() method returns negative one (-1) if the item that you are looking for was not found.
        corsOptions = {origin: true}; //This means that we are checking if the origin can be found in the whitelist, if it is not -1 it means that it was found.  "Origin: true" allows this request to be accepted. 
    } else { //If the origin was not found in the whitelist, we will set the courseOptions as origin: false.
        corsOptions= {origin: false};
    }
    callback(null, corsOptions); //This shows that no error has occured and then passing in the corsOptions.
}; 

exports.cors= cors(); //When we call cors, it will return to us a middleware function configured to set a cors header of Access Control Allow Origin on our response object with a wildcard as its value (which means it will allow cors for all origins). 
exports.corsWithOptions= cors(corsOptionsDelegate); //This cors function will return to us a middleware function and will check to see if the incoming request belongs to the whitelisted origins (localhost:3000 or localhost:3443). If it does, it will send us back the cors response header of Access Control Allow Origin (this time with the whitelisted origin as the value). If it doesn't, no corse header.