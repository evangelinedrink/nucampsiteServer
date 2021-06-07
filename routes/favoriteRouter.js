const express= require("express"); //Importing the Express module
const cors= require("./cors"); // ./ is needed because if you don't have ./, then node will think we are importing the cors module from the node_modules folder. Here we are importing the cors module that was created in the Routes folder
const authenticate= require("../authenticate"); //Control routes with authentication, protecting the campsiteRouter with code from authenticate.js
const Favorite= require("../models/favorite.js");  //Importing the Favorite module
const favoriteRouter= express.Router(); //Creating the favoriteRouter using the express.Router() method.

//Methods have been chained together by using the .router("/") method.
//The path is already set by the .route("/"), which is why we don't have the path argument for each of these HTTP verbs.
favoriteRouter.route("/") //The / means for the favorite path (/favorites). In this line we are retting up the first route.
//Setting up CORS
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Creating the Preflight Request using the .options() method. This will handle a Preflight Request. Anytime a client needs to Preflights a request, it will send a request with the HTTP options method. Then the client will wait for the server to respond with information on what kind of request it will accept.
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    //Retrieve the favorite document for that user using Favorite.find()
    Favorite.find({user: req.user._id}) //Passing in the object {user: req.user._id}
    //Retrieving the favorite document using two populate() methods to populate the user and campsites refs.  populate() method lets us reference documents in other collections.
    .populate("user")
    .populate("campsites")
    //.find() method returns a JavaScript promise, what to do with the promise when it works and doesn't work is shown below.
    .then(favorite => { //Accessing the results of the find method. This is where the res objects will be at.
        res.setHeader("Content-Type", "application/json");
        res.statusCode= 200;
        res.json(favorite);//Returning the favorite document using the res.json() method.
    })
    .catch(err => next(err)); //Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express) 
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    //Check to see if the favorite document exists
    .then(favorite => {
        if(favorite) { //Making sure that our favorite document (it is the Favorite array in the favorite.js file) is actually there/present.
           //For this /favorites route, we are looking at all the campsites in the Favorite document (array), not just one favorite campsite. This is why we have to do the loop through all the favorite campsites.
           req.body.forEach( oneFavorite => { //Going through each one of the favorite campsites in the Favorite document (array)
            if(!favorite.campsites.includes(oneFavorite._id)) { //If the Favorite Array does not include the campsite's ID (the campsite is not there already), it will add the campsite's id (oneFavorite._id) to the Favorite document/array.
                    favorite.campsites.push(oneFavorite._id);  //Including the new campsite ID to the Favorite array
                }
            });
                favorite.save() //Saves the new Favorite and comment in the Favorite's array located in the MongoDB's database (in the comment's subdocument). This is not a static method (it does create an object, an array).
                .then(favorite => {
                    res.statusCode= 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite); //Favorit document is being sent back to the client.
                })
                .catch(err => next(err)); 
            } else { //If the Favorite document/array hasn't been created yet, the code below will display.
                Favorite.create({user: req.user._id}) //Create a new Favorite document/array to place the favorite campsites in.
                .then(favorite => {
                    req.body.forEach(oneFavorite => { //Going through each one of the favorite campsites in the Favorite document (array)
                        if(!favorite.campsites.includes(oneFavorite._id)) { //If the Favorite Array does not include the campsite's ID (the campsite is not there already), it will add the campsite's id (oneFavorite._id) to the Favorite document/array.
                                favorite.campsites.push(oneFavorite._id);  //Including the new campsite ID to the Favorite array
                            }
                });
                favorite.save() //Saves the new Favorite and comment in the Favorite's array located in the MongoDB's database (in the comment's subdocument). This is not a static method (it does create an object, an array).
                .then(favorite => {
                    res.statusCode= 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite); //Favorit document is being sent back to the client.
                })
                .catch(err => next(err)); 
            })
            .catch(err=> next(err));
        }
    }).catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode= 403;
    res.end("PUT operation not supported on /favorites");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id}) //Use findOneAndDelete() method to locate the favorite document corresponding to this user and delete it
    //findOneAndDelete() method returns a JavaScript Promise, so use .then
    .then(favorite => {
        res.statusCode= 200;
        if(favorite) { //If the Favorite document (array) is found.
            res.setHeader("Content-Type", "application/json");
            res.json(favorite); //Favorit document is being sent back to the client.
        } else { //If no Favorite document is found
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete."); 
        }
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
});



//Adding a new Express Router for the /:campsiteId route parameter (this specifies which campsite based on its ID). These are endpoints for a specific campsite based on the campsite's ID.
favoriteRouter.route("/:campsiteId") //The / means for the favorite path. In this line we are retting up the first route.
//Setting up CORS
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Creating the Preflight Request using the .options() method. This will handle a Preflight Request. Anytime a client needs to Preflights a request, it will send a request with the HTTP options method. Then the client will wait for the server to respond with information on what kind of request it will accept.
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode= 403;
    res.end(`GET operation not supported on /campsites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) //Locating the favorite document of the user with their user._id (user's id)
    .then(favorite => {
        if(favorite) {
        if(!favorite.campsites.includes(req.params.campsiteId)) { //If the campsite specified in the URL parameter is not in the favorites.campsites array (Favorite document in the favorite.js file)
            favorite.campsites.push(req.params.campsiteId); //Adding the campsite specified in the URL parameter to the favorites.campsites array
            favorite.save()
            .then(favorite=>{
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch(err=> next(err));
        } else { //If the campsite specified in the URL parameter is in the favorites.campsites array (Favorite document in the favorite.js file)
            res.statusCode= 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("That campsite is already in the list of favorites!");
        }
    } else { //If the Favorite document/array hasn't been created yet, the code below will display.
        Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId]})
        .then(favorite => {
            res.statusCode= 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
        })
        .catch(err=> next(err));
    }
    })
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express)
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode= 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) //Locating the favorite document of the user with their user._id (user's id)
    .then(favorite => {
        if(favorite) { //Checking to see if the Favorite document is there
            if(favorite.campsites.indexOf(req.params.campsiteId) !==-1) { //If the campsideId's index number is not equal to -1, this means that the campside Id is in the array (-1 index Id means it is not in the array)
                favorite.campsites.splice(req.params.campsiteId)  //We get rid of the campsite Id by splicing it out of the array
            }
            favorite.campsites.save() //Make sure to have the save() method outside of the If statement so that the favorite.campsites array (part of the Favorite document/array) will be saved and updated.
            .then(favorite => { //This will be returned to the client once the campsite Id has been deleted from the array
                res.statusCode= 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite); //Favorite document is being sent back to the client.
            })
        } else { //If no Favorite document is found
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete."); 
        }
    }) 
    .catch(err => next(err));//Catch method to catch any errors. Next(err) will pass off the error to the overall error() handler. Express will decide what to do with the error (already built into Express). Catch method is always used with a .then after a JavaScript Promise.
});

//Export Favorite Router
module.exports= favoriteRouter;