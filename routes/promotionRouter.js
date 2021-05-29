const express= require("express");
const Promotion = require("../models/promotion"); //Importing the Promotion model to this file. ../ lets the computer know to go up one folder 
const authenticate= require("../authenticate"); //Control routes with authentication, protecting the campsiteRouter with code from authenticate.js
const promotionRouter= express.Router();

/*Verify that the user is authenticated for every endpoint in this router, except for the Get endpoints.  Get request is a simple read only operation, it doesn't change anything in the server side. 
This will be done using the authenticate.verifyUser parameter.*/

promotionRouter.route("/")
.get((req, res, next)=> {
    Promotion.find() //Static method to query the database.  Will find all the partners since there is no promotion specified in the parenthesis. Client is asking us to send data for all of the promotions
    .then(promotions => {
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); //Send the request content in JSON form. This parameter has to be set to send the request body in JSON form.
        res.json(promotions); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. 
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post(authenticate.verifyUser, (req,res, next) => {
    Promotion.create(req.body) //Create a new promotion document and save it to the MongoDB server. Create this document with the req.body, which should contain the information of the promotion to Post from the client. Through this create() method, Mongoose will make sure that it fits the schema that was defined.
    .then(promotion => { //The create() method will return a JavaScript Promise, so we can use .then() method to handle a fulfilled Promise.
        console.log("Promotion Created", promotion);  //promotion will hold information about the document that was posted. Inside of this console.log, we will get information about the promotion.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); //Send the request content in JSON form. This parameter has to be set to send the request body in JSON form.
        res.json(promotion); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put(authenticate.verifyUser, (req,res)=> {
    res.statusCode= 403;
    res.end("PUT operation not supported on /promotions");
})
.delete(authenticate.verifyUser, (req, res, next)=> {
    Promotion.deleteMany() //Using the deleteMany() static method which will pass in an empty parameter list (nothing in parenthesis), which will result in every document in the promotion's collection to be deleted.
    .then(response => { //Access the return value of the deleteMany() method, which will give us information about the response object about how many documents were deleted.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //This will send the response back to the user with json type data.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});


//Adding a new Express Router for the /:promotionId route parameter
promotionRouter.route("/:promotionId")
.get((req,res, next) => {
    Promotion.findById(req.params.promotionId) //findById() method is from Mongoose and we will pass it the Id stored in the route parameter (for partnerId). This Id will get parsed from the HTTP request from whatever the user from the client side typed in as the partnerId they want to access.
    .then(promotion => {
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req,res) => {
    res.statusCode=403;
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}.`);
})
.put(authenticate.verifyUser, (req,res, next) => {
    //Below the first parameter is the promotion id (req.params.promotionId), the second argument is the data from the request body ($set: req.body)
    //Third parameter is {new:true}, so that we get back information about the updated document.
    Promotion.findByIdAndUpdate(req.params.promotionId, { //req.params.promotionId is the saved route parameter that has the information on the promotion's ID
        $set: req.body
    }, {new: true})
    .then(promotion => { //When the promotionId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.delete(authenticate.verifyUser, (req,res, next) => {
    //Method used for deleting a single promotion by its ID is called: findByIdAndDelete() method
    Promotion.findByIdAndDelete(req.params.promotionId) //req.params.promotionId is the saved route parameter that has the information on the promotion's ID
    .then(response => { //When the promotionId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. 
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});


//Export Promotion Router
module.exports= promotionRouter;