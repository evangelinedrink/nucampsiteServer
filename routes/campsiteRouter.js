const express = require("express");
const Campsite = require("../models/campsite"); //../ lets the computer know to go up one folder 
const authenticate= require("../authenticate"); //Control routes with authentication, protecting the campsiteRouter with code from authenticate.js
const campsiteRouter= express.Router();

/*Verify that the user is authenticated for every endpoint in this router, except for the Get endpoints.  Get request is a simple read only operation, it doesn't change anything in the server side. 
This will be done using the authenticate.verifyUser parameter.*/

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
    .populate("comments.author") //Tells application that campsite comments is received, find the user document that matches the object id stored in comments.author
    .then(campsites => { //Access the results of the find method as campsites.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json"); //Send the request content in JSON form. This parameter has to be set to send the request body in JSON form.
        res.json(campsites); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method below
    })
    //res.end("Will send all the campsites to you");  //Just shows that we can access this code for now
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post(authenticate.verifyAdmin, (req,res, next) => {
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
.put(authenticate.verifyUser, (req,res)=> { //This handler will be left as is because PUT is not allowed. 
    res.statusCode= 403;
    res.end("PUT operation not supported on /campsites");
})
.delete(authenticate.verifyAdmin, (req, res, next)=> { //next() method is used for error handling. Only verified Admin users can delete posts (because of the authenticate.verifyAdmin)
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
    .populate("comments.author")
    .then(campsite => { //When the campsiteId is successfully found, the .then will then start working (result from the JavaScript Promise)
       res.statusCode= 200;
       res.setHeader("Content-Type", "application/json");
       res.json(campsite); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
    //res.end(`Will send details of the campsite: ${req.params.campsiteId} to you.`);
})
.post(authenticate.verifyUser, (req,res) => {
    res.statusCode=403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}.`);
})
.put(authenticate.verifyAdmin, (req,res, next) => {
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
.delete(authenticate.verifyAdmin, (req,res, next) => {
    //Method used for deleting a single campsite by its ID is called: findByIdAndDelete() method
    Campsite.findByIdAndDelete(req.params.campsiteId) //req.params.campsiteId is the saved route parameter that has the information on the campsite's ID
    .then(response => { //When the campsiteId is successfully found, the .then will then start working (result from the JavaScript Promise)
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //Send the information about the posted document to the client in json form.  This will automatically close the response stream afterward. Will not need the res.end method below.
     })
     .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});

//Endpoinds for /:campsiteId/comments
campsiteRouter.route("/:campsiteId/comments") 
.get((req,res, next)=> {
    Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
    .populate("comments.author")
    .then(campsite => { //Access the results of the find method as campsites.
        //Getting just one campsite, not all the campsite
        if (campsite) {
            res.statusCode= 200;
            res.setHeader("Content-Type", "application/json"); 
            res.json(campsite.comments); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method below
        } else {
            err= new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status= 404;
            return next (err);
        }   
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post(authenticate.verifyUser, (req,res, next) => {
    Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
    .then(campsite => { //Access the results of the find method as campsites.
        //Getting just one campsite, not all the campsite
        if (campsite) {
            req.body.author= req.user._id; //When comment is saved, it will have the ID of the user.  This adds the current user's _id to author field when a new comment is added.
            campsite.comments.push(req.body); //Adding the comment for the campsite in the comment's array, which is found in the req.body. This will only change the comments array in the application's memory, not in the comments subdocument in the MongoDB's database.
            campsite.save() //Saves the new comment in the comment's array located in the MongoDB's database (in the comment's subdocument). This is not a static method (it does create an object, an array).
            .then(campsite => { //.save() method above returns a Promise, so we can connect a .then method if the Promise is fulfilled.   
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json"); 
                res.json(campsite); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method.
            })
            .catch(err => next(err));
        } else {
            err= new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status= 404;
            return next (err);
        }   
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put(authenticate.verifyUser, (req,res)=> { //This handler will be left as is because PUT is not allowed. 
    res.statusCode= 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(authenticate.verifyAdmin, (req, res, next)=> { //next() method is used for error handling
    Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
    .then(campsite => { //Access the results of the find method as campsites.
        //Getting just one campsite, not all the campsite
        if (campsite) {
            //Going to delete every comment in the campsite's comments array. To do this, we will use a For loop.
            for (let i=(campsite.comments.length-1); i>=0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove(); //Access each comment in the comment's array, one at a time. Using a method's id() and remove()
            }
            campsite.save() //Saves the new comment in the comment's array located in the MongoDB's database (in the comment's subdocument). This is not a static method (it does create an object, an array).
            .then(campsite => { //.save() method above returns a Promise, so we can connect a .then method if the Promise is fulfilled.   
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json"); 
                res.json(campsite); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method.
            })
            .catch(err => next(err));
        } else {
            err= new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status= 404;
            return next (err);
        }
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});  
    /*Campsite.deleteMany() //Using the deleteMany() static method which will pass in an empty parameter list, which will result in every document in the campsite's collection to be deleted.
    .then(response => { //Access the return value of the deleteMany() method, which will give us information about the response object about how many documents were deleted.
        res.statusCode= 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response); //This will send the response back to the user with json type data.
    }) */

//Endpoinds for /:campsiteId/comments/:commentId
campsiteRouter.route("/:campsiteId/comments/:commentId") //This will handle request for a specific comment for a certain campsite
.get((req,res, next)=> {
    Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
    .populate("comments.author")
    .then(campsite => { //Access the results of the find method as campsites.
        //Getting just one campsite, not all the campsite
        if (campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode= 200;
            res.setHeader("Content-Type", "application/json"); 
            res.json(campsite.comments.id(req.params.commentId)); //This method will send json data to the client in the response stream and will automatically close the response stream afterward. Will not need the res.end method below
        } else if (!campsite) { //This else if block is if there is no campsite
            err= new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status= 404;
            return next (err);
        } else {
            err= new Error(`Comment ${req.params.commentId} not found`);
            err.status= 404;
            return next (err);
        }   
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.post(authenticate.verifyUser, (req,res) => { //Post is not supported for the comment's Id
   res.statusCode= 403;
   res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req,res, next)=> { //PUT request updates existing data. In this case, PUT request will update the comment by letting the user update the comment text and the rating fields.
        Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
        .then(campsite => { //Access the results of the find method as campsites.
            //Getting just one campsite, not all the campsite
            if (campsite && campsite.comments.id(req.params.commentId)) {
                if (req.body.rating) { //Rating for the comment can be changed. Separate if statements because both of them will be checked at a time. The user might only change one of these (either comment or rating), so we need two if statements.
                    campsite.comments.id(req.params.commentId).rating= req.body.rating;
                }
                if (req.body.text) { //The comment can be modified. Separate if statements because both of them will be checked at a time. The user might only change one of these (either comment or rating), so we need two if statements.
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save() //Saves the changes in the comments on the MongoDB database.
                .then(campsite => { //If the save() operation succeeds, it will send back a response back to the client.
                    res.statusCode= 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(campsite);
                }) 
                .catch(err => next(err)); //Catches any errors if the save() method does not succeed.
            } else if (!campsite) { //This else if block is if there is no campsite
                err= new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status= 404;
                return next (err);
            } else {
                err= new Error(`Comment ${req.params.commentId} not found`);
                err.status= 404;
                return next (err);
            }   
        })
        .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.delete(authenticate.verifyUser, (req, res, next)=> { //next() method is used for error handling
    Campsite.findById(req.params.campsiteId)//The client is looking for a single campsite and the campsite id has been given as a route parameter. Always look at the documentation for libraries to understand what each part means. 
    .then(campsite => { //Access the results of the find method as campsites.
        //Getting just one campsite, not all the campsite
        if (campsite && campsite.comments.id(req.params.commentId)) {
           campsite.comments.id(req.params.commentId).remove();
            campsite.save() //Saves the changes in the comments on the MongoDB database.
            .then(campsite => { //If the save() operation succeeds, it will send back a response back to the client.
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
            }) 
            .catch(err => next(err)); //Catches any errors if the save() method does not succeed.
        } else if (!campsite) { //This else if block is if there is no campsite
            err= new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status= 404;
            return next (err);
        } else {
            err= new Error(`Comment ${req.params.commentId} not found`);
            err.status= 404;
            return next (err);
        }   
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});  

//Export Campsite Router
module.exports= campsiteRouter;