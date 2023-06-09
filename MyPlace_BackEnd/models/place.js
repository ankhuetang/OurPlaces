const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//create blueprint for a place
const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true}, //store image URL
    address: {type: String, required: true},
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true}
    },
    creator: {type: mongoose.Types.ObjectId, required: true, ref: "User" }
})

//create model
module.exports = mongoose.model("Place", placeSchema); //model func requires model name and Schema

