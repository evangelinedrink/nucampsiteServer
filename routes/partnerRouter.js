const express= require("express");
const Partner = require("../models/partner"); //Importing the Partner model to this file. ../ lets the computer know to go up one folder 
const authenticate= require("../authenticate"); //Control routes with authentication, protecting the campsiteRouter with code from authenticate.js
const cors= require("./cors"); // ./ is needed because if you don't have ./, then node will think we are importing the cors module from the node_modules folder. Here we are importing the cors module that was created in the Routes folder
const partnerRouter= express.Router();

/*Verify that the user is authenticated for every endpoint in this router, except for the Get endpoints.  Get request is a simple read only operation, it doesn't change anything in the server side. 
This will be done using the authenticate.verifyUser parameter.*/

partnerRouter.route("/") //The /partners route is handled in the partnerRouter with just a "/"
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //This will handle a Preflight Request. Anytime a client needs to Preflights a request, it will send a request with the HTTP options method. Then the client will wait for the server to respond with information on what kind of request it will accept.
.get(cors.cors, (req, res, next)=> {
    Partner.find() //Static method to query the database.  Will find all the partners since there is no partner specified in the parenthesis. Client is asking us to send data for all of the partners
    .then(partners => {
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); //Send the request content in JSON form. This parameter has to be set to send the request body in JSON form.
        res.json(partners); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. 
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res, next) => {
    Partner.create(req.body) //Create a new partner document and save it to the MongoDB server. Create this document with the req.body, which should contain the information of the partner to Post from the client. Through this create() method, Mongoose will make sure that it fits the schema that was defined.
    .then(partner => { //The create() method will return a JavaScript Promise, so we can use .then() method to handle a fulfilled Promise.
        console.log("Partner Created", partner);  //partner will hold information about the document that was posted. Inside of this console.log, we will get information about the partner.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); //Send the request content in JSON form. This parameter has to be set to send the request body in JSON form.
        res.json(partner); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res)=> { //Requires admin authentication
    res.statusCode= 403;
    res.end("PUT operation not supported on /partners");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next)=> {
    Partner.deleteMany() //Using the deleteMany() static method which will pass in an empty parameter list (nothing in parenthesis), which will result in every document in the partner's collection to be deleted.
    .then(response => { //Access the return value of the deleteMany() method, which will give us information about the response object about how many documents were deleted.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //This will send the response back to the user with json type data.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});

//Adding a new Express Router for the /:partnerId route parameter (this specifies which partner based on its Id). These are endpoints for a specific partner based on the partner's ID.
partnerRouter.route("/:partnerId")
.options(cors.corsWithOptions, (req, res)=> res.sendStatus(200))
.get(cors.cors, (req,res, next) => {
    Partner.findById(req.params.partnerId) //findById() method is from Mongoose and we will pass it the Id stored in the route parameter (for partnerId). This Id will get parsed from the HTTP request from whatever the user from the client side typed in as the partnerId they want to access.
    .then(partner => {
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res) => {
    res.statusCode=403;
    res.end(`POST operation not supported on /partners/${req.params.partnerId}.`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res, next) => {
    //Below the first parameter is the partner id (req.params.partnerId), the second argument is the data from the request body ($set: req.body)
    //Third parameter is {new:true}, so that we get back information about the updated document.
    Partner.findByIdAndUpdate(req.params.partnerId, { //req.params.partnerId is the saved route parameter that has the information on the partner's ID
        $set: req.body
    }, {new: true})
    .then(partner => { //When the partnerId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(partner); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res, next) => {
    //Method used for deleting a single partner by its ID is called: findByIdAndDelete() method
    Partner.findByIdAndDelete(req.params.partnerId) //req.params.partnerId is the saved route parameter that has the information on the partner's ID
    .then(response => { //When the partnerId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. 
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});

//Export Partner Router
module.exports= partnerRouter;