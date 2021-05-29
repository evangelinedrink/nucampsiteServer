const mongoose= require("mongoose");
const Schema= mongoose.Schema;

//First argument will hold the structure of the user document within the object's properties
 
const userSchema= new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default:false
    }
});

//Exporting the module. The first argument is the name of the module (User) and the second argument is the schema (userSchema)
module.exports= mongoose.model("User", userSchema);