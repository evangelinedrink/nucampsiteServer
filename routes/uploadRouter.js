const express= require ("express"); //Import Express
const authenticate= require("../authenticate");
const multer= require("multer"); //Import Multer middleware

//Setting up some custom configuration on how Multer handles file uploads (we could leave this out and use default values that Multer has).
//Customizing the storage (we will be using diskStorage, which is in Multer.)
const storage= multer.diskStorage({
    destination: (req, file, cb) => { //First configuration: Destination property takes a function, it needs the request object, the file and the callback function (which is called cb)
        cb(null, "public/images"); //Function body: we will use cb and pass null into it (first argument) to say that there is no error, second argument is the path where we want to save the file to ("public/images" that way file can be accessed as a static file by people visiting the site)
    },
    filename: (req, file, cb) => { //Second configuration: Adding a filename. Similar setup as destination. filename will be given a function with the parameters: req, file, and cb
        cb(null, file.originalname) //.originalname method will make sure that the name of the file in the server will be the name of the file in the client side. If we don't do this, Multer (be default) will give some random string s the name of the file (fine for some cases).
    } 
});

//Create a file filter
const imageFileFilter= (req, file, cb) => { //Same parameters as destination and filename properties
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){ //Regex expression. The dollar sign at the end means it is the end of the Regex string. The | between types of files is the "or" operand. This Regex statement probably means the file being uploaded should be these file types.
        return cb(new Error("You can upload only image files!"), false); //Call and return the callback funtion (cb) with a new error. The second argument is "false," which tells Multer to reject this file upload.
    } 
    cb(null, true); //Since there is a return statement in the if block, we can be sure that the file name does have an image extention of .jpeg or .png. So, we will call the callback function to null meaning there is no error and "true", which tells Multer to accept this file.
};

//Call the Multer function. In the below line, Multer module is configured to enable image file uploads.
const upload= multer({storage: storage, fileFilter: imageFileFilter}); //we are passing in the options that was configured above: storage and imageFileFilter (these are the second values after the color, the first values before hte colon is the name that Multer has for these options)

//Setting up the Router
const uploadRouter= express.Router();

//Configure the uploadRouter to handle the various HTTP requests (such as GET, POST, DELETE, PUT).
uploadRouter.route("/")
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {  //Series of middleware as arguments. The final callback function will handle the response. The callback funtion has parameters (req and res)
    res.statusCode= 403;
    res.end("GET operation not supported on /imageUpload."); //Send back a response to the client. /imageUpload is the path that will be used. 
}) 
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single("imageFile"), (req, res) => {  //Series of middleware as arguments. Adding the multer middleware before the callback function. This is done by using upload.single("imageFile").  The single means we are expecting a single file whose input field name is "imageFile". When the client uploads a file to the server, Multer will take over and handle processing it and errors. Once Multer is finished (this means file has successfully uploaded), the callback function will handle the response. The callback funtion has parameters (req and res)
    res.statusCode= 200;
    res.setHeader("Content-Type", "application/json"); //Setting a header (this content-type and application/json is needed)
    res.json(req.file);//Multer adds an object to the request object named file and the file object will contain additional information about the file. This information will be sent back to the client. This will confirm to the client that the file has been received correctly.
    //req.file in the line above contains the fieldname, originalname, encoding type, mimetype, destination, filename, path and size
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {  //Series of middleware as arguments. The final callback function will handle the response. The callback funtion has parameters (req and res)
    res.statusCode= 403;
    res.end("PUT operation not supported on /imageUpload."); //Send back a response to the client. /imageUpload is the path that will be used. 
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {  //Series of middleware as arguments. The final callback function will handle the response. The callback funtion has parameters (req and res)
    res.statusCode= 403;
    res.end("DELETE operation not supported on /imageUpload."); //Send back a response to the client. /imageUpload is the path that will be used. 
})


//Export this uploadRouter
module.exports= uploadRouter;
