const mongoose= require("mongoose"); //Importing Mongoose
const Schema= mongoose.Schema; //This is not required, but it is easier to type Schema than Mongoose Schema every time.

//Requiring the Mongoose Currency Method. loadType() method will load the new currency type into Mongoose, so that it is available for Mongoose Schemas to use.
require("mongoose-currency").loadType(mongoose);
const Currency= mongoose.Types.Currency; //Short-hand for Mongoose.Types.Currency

//New Schema to store comments about a campsite
const commentSchema= new Schema({ //The comment on the campsite has its own ID.
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId, //Stores a reference to a user's document. The author has its own ID thanks to the "Schema.Types.ObjectId".  We are making sure the author's ID is equal to the user's ID.
        ref: "User"
    }
}, {
    timestamps: true
});

//Creating a new Schema using Mongoose. The first argument is required, it contains the definition of the schema and is an object.
//The second argument in the Schema() method is optional and is used for setting various configuration options.
const campsiteSchema= new Schema({ //Each campsite has its own ID.
    name: {
        type: String,
        required: true,
        unique: true, //no 2 documents should have the same name field
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency, //This is where we will be using Mongoose Currency
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    //Creating a comments schema (this is a sub-schema)
    comments: [commentSchema]
}, {
    timestamps: true, //Tells us the time when the document was created and also updated.
});

//Creating a Model with Mongoose. The model will instantiate new documents for that collection. Model will also enforce structure from Schema and validate documents.
//The first argument for the mongoose.model() method is the singular version of the name of the collection that we want to use for the model. This first argument must be capitalized.
//Second argument is the schema that we are passing through that we want to use for this collection.
//mongoose.model() method returns a constructor function. Constructor function is the de-sugared class of classes.
const Campsite= mongoose.model("Campsite", campsiteSchema);

module.exports= Campsite;

