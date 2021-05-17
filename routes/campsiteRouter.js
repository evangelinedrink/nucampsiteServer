const express = require("express");
const campsiteRouter= express.Router();

//Methods have been chained together by using the .router("/") method.
//The path is already set by the .route("/"), which is why we don't have the path argument for each of these HTTP verbs.
campsiteRouter.route("/")
.all((req, res, next) => {
    res.statusCode= 200;
    res.setHeader("Content-Type", "text/plain");
    next(); //Pass control of the application routing to the next routing method after this one.
})
.get((req,res)=> {
    res.end("Will send all the campsites to you");  //Just shows that we can access this code for now
})
.post((req,res) => {
    res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
})
.put((req,res)=> {
    res.statusCode= 403;
    res.end("PUT operation not supported on /campsites");
})
.delete((req, res)=> {
    res.end("Deleting all campsites");
});

//Adding a new Express Router for the /:campsiteId route parameter
campsiteRouter.route("/:campsiteId")
.all((req, res, next) => {
    res.statusCode= 200;
    res.setHeader("Content-Type", "text/plain");
    next();
})
.get((req,res) => {
    res.end(`Will send details of the campsite: ${req.params.campsiteId} to you.`);
})
.post((req,res) => {
    res.statusCode=403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}.`);
})
.put((req,res) => {
    res.write(`Updating the campsite: ${req.params.campsiteId}\n`);
    res.end(`Will update the campsite: ${req.body.name} with description: ${req.body.description}`);
})
.delete((req,res) => {
    res.end(`Deleting campsite: ${req.params.campsiteId}.`);
});

//Export Campsite Router
module.exports= campsiteRouter;