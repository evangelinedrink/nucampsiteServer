const mongoose= require("mongoose"); //Importing Mongoose
const Schema= mongoose.Schema; //This is not required, but it is easier to type Schema than Mongoose Schema every time.

//Requiring the Mongoose Currency Method. loadType() method will load the new currency type into Mongoose, so that it is available for Mongoose Schemas to use.
require("mongoose-currency").loadType(mongoose);
const Currency= mongoose.Types.Currency; //Short-hand for Mongoose.Types.Currency

//New Schema to display Promotions
const promotionSchema= new Schema({
    name: {
        type: String,
        required: true,
        unique: true, //No 2 documents should have the same name field
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: true,
    },
    cost: {
        type: Currency, //This is where we will be using Mongoose Currency
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
    }
}, {
    timestamps: true //Tells us the time when the document was created and also updated. It will generate the CreatedAt and UpdatedAt timestamps.
});

//Creating a Model with Mongoose. The model will instantiate new documents for that collection. Model will also enforce structure from Schema and validate documents.
//The first argument for the mongoose.model() method is the singular version of the name of the collection that we want to use for the model. This first argument must be capitalized.
//Second argument is the schema that we are passing through that we want to use for this collection.
//mongoose.model() method returns a constructor function. Constructor function is the de-sugared class of classes.
const Promotion= mongoose.model("Promotion", promotionSchema);

//Export the Promotion Model
module.exports= Promotion;