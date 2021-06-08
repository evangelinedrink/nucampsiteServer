const mongoose= require("mongoose"); //Importing Mongoose
const Schema= mongoose.Schema; //This is not required, but it is easier to type Schema than Mongoose Schema every time.

//Creating a new Mongoose Schema named favoriteSchema, which will contain two fields: user and campsites
const favoriteSchema= new Schema({
    user: { //Model named user
        type: Schema.Types.ObjectId, //Stores a reference to a user's document
        ref: "User",
    },
    campsites: [{ //Model named campsites.  campsites is enclosed in an array that will contain campsite IDs, each user will have an array of their favorite campsite's IDs.  
        type: Schema.Types.ObjectId, //Stores a reference to a user's document
        ref: "Campsite",
    }]
}, {
    timestamps: true,
});

//Creating a Model with Mongoose. The model will instantiate new documents for that collection. Model will also enforce structure from Schema and validate documents.
//The first argument for the mongoose.model() method is the singular version of the name of the collection that we want to use for the model. This first argument must be capitalized.
//Second argument is the schema that we are passing through that we want to use for this collection.
//mongoose.model() method returns a constructor function. Constructor function is the de-sugared class of classes.
const Favorite= mongoose.model("Favorite", favoriteSchema);

module.exports= Favorite;