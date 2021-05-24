const express = require("express");
const Campsite = require("../models/campsite"); //../ lets the computer know to go up one folder 
const campsiteRouter= express.Router();

//Methods have been chained together by using the .router("/") method.
//The path is already set by the .route("/"), which is why we don't have the path argument for each of these HTTP verbs.
campsiteRouter.route("/") //The / means for the campsite path
/*.all((req, res, next) => {
    res.statusCode= 200;
    res.setHeader("Content-Type", "text/plain");
    next(); //Pass control of the application routing to the next routing method after this one.
})*/
.get((req,res, next)=> {
    Campsite.find()//Static method to query the database.  Will find all the campsites since there is not specific campsite specified in the parenthesis. //Client is asking us to send data for all of the campsites
    .then(campsites => { //Access the results of the find method as campsites.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); 
        res.json(campsites); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method below
    })
    //res.end("Will send all the campsites to you");  //Just shows that we can access this code for now
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post((req,res, next) => {
    Campsite.create(req.body) //Create a new campsite document and save it to the MongoDB server. Create this document with the req.body, which should contain the information of the campsite to Post from the client. Through this create() method, Mongoose will make sure that it fits the schema that was defined.
    .then(campsite => { //The create() method will return a JavaScript Promise, so we can use .then() method to handle a fulfilled Promise.
        console.log("Campsite Created ", campsite); //campsite will hold information about the document that was posted. Inside of this console.log, we will get information about the campsite
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
        //res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put((req,res)=> { //This handler will be left as is because PUT is not allowed. 
    res.statusCode= 403;
    res.end("PUT operation not supported on /campsites");
})
.delete((req, res, next)=> { //next() method is used for error handling
    //res.end("Deleting all campsites");
    Campsite.deleteMany() //Using the deleteMany() static method which will pass in an empty parameter list, which will result in every document in the campsite's collection to be deleted.
    .then(response => { //Access the return value of the deleteMany() method, which will give us information about the response object about how many documents were deleted.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //This will send the response back to the user with json type data.
    }) 
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});

//Adding a new Express Router for the /:campsiteId route parameter (this specifies which campsite based on its ID). These are endpoints for a specific campsite based on the campsite's ID.
campsiteRouter.route("/:campsiteId")
/*.all((req, res, next) => {
    res.statusCode= 200;
    res.setHeader("Content-Type", "text/plain");
    next();
})*/
.get((req,res, next) => {
    Campsite.findById(req.params.campsiteId)//findById() method is from Mongoose and we will pass it the Id stored in the route parameter (for campsiteId). This Id will get parsed from the HTTP request from whatever the user from the client side typed in as the campsiteId they want to access.
    .then(campsite => { //When the campsiteId is successfully found, the .then will then start working (result from the JavaScript Promise)
       res.statusCode= 200;
       res.setHeader("Content-Type", "application/json");
       res.json(campsite); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
    //res.end(`Will send details of the campsite: ${req.params.campsiteId} to you.`);
})
.post((req,res) => {
    res.statusCode=403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}.`);
})
.put((req,res, next) => {
    //Below the first parameter is the campsite id (req.params.campsiteId), the second argument is the data from the request body ($set: req.body)
    //Third parameter is {new:true}, so that we get back information about the updated document.
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, {new: true})
    .then(campsite => { //When the campsiteId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(campsite); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
     })
     .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
    //Below is just placeholder code
    //res.write(`Updating the campsite: ${req.params.campsiteId}\n`);
    //res.end(`Will update the campsite: ${req.body.name} with description: ${req.body.description}`);
.delete((req,res, next) => {
    //Method used for deleting a single campsite by its ID is called: findByIdAndDelete() method
    Campsite.findByIdAndDelete(req.params.campsiteId) //req.params.campsiteId is the saved route parameter that has the information on the campsite's ID
    .then(response => { //When the campsiteId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
     })
     .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});

//Export Campsite Router
module.exports= campsiteRouter;