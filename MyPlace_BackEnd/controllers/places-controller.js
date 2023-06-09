const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require('mongoose');



const getPlaceById = async (req, res, next) => {
    //.params is an express property de access value ua url param (pid)
    const placeId = req.params.pid;
    //find place object that has id matching pid from get request
    //findByID la function cua mongoose model Place
    let place
    try{
        place = await Place.findById(placeId);
    }catch(err) { //error if get request has missing info
     const error = new HttpError("Could not find place", 500 )
     return next(error);
    }


    if(!place){ //reuqest is fine but cant find ID in databse
        const error =  new HttpError("Could not find that placeId", 404);
        return next(error);
    };
    //getters: true de bo dau _ trong _id
    res.json({place: place.toObject({getters:true})}); //co the shorten: res.json({place});
}

const getPlacesByUserId = async (req, res, next)=>{
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try{
        userWithPlaces = await User.findById(userId).populate("places"); //populate array chua IDs cua places de access dc places
    } catch(err){
        const error = new HttpError("Fetching places failed, try again", 500);
        return next(error);
    }
   
    if(!userWithPlaces || userWithPlaces.places.length === 0){
        return next(new HttpError("No places for this user", 404));
    }
    //send json values
    res.json({places: userWithPlaces.places.map(p => p.toObject({getters: true}))}); //places la rray nen dc map qua
    
}

const createPlace = async (req, res, next) => {
    //connect validation vs validation set up in places-routes
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next( new HttpError("Invalid input, please try again", 422));
    }

    //objects expected from incoming request, parsed by req.body
    const {title, description, address} = req.body;
    
    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    }catch (error) {
        return next(error);
    }
    
//call model Place
    const createdPlace = new Place({
        title, //tuong tu title: title
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId //id from token
    });

    //tim user vs creator ID o req.body
    let user;
    try{
        user = await User.findById(req.userData.userId);
    } catch(err){
        const error = new HttpError("Creating place failed", 500);
        return error;
    }
    //check xem user co exist ko
    if(!user){
        const error = new HttpError("Could not find user with that ID", 404);
        return next(error);
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess}); //store the place with a unique placeID
        
        user.places.push(createdPlace); //mongoose behind the scene adds placeID to user.places array
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch(err){
        const error =  new HttpError(
            "Creating place failed, please try again",
            500
        );
        return next(error); //stop if has error

    }
    
    res.status(201).json({place: createdPlace});
}

const updatePlaceById = async (req, res, next) => {
    //connect validation vs validation set up in places-routes
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(
            new HttpError("Invalid input, please try again", 422)
        );
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;
    
    let place;
    try{
        //find place object that has id matching pid from get request
        place = await Place.findById(placeId);
        
    } catch(err){
        const error =  new HttpError(
            "Updating place failed, please try again",
            500
        );
        return next(error); //stop if has error
    }

    //neu ko dung la user who create post
    if(place.creator.toString() !== req.userData.userId){
        const error =  new HttpError(
            "Not allowedd to edit this place",
            500
        );
        return next(error); //stop if has error
    }

    //update place tim dc
    place.title = title;
    place.description = description;
    try{
        await place.save();
    }catch(err){
        const error =  new HttpError(
            "Updating place failed 2, please try again",
            500
        );
        return next(error); //stop if has error
    }
    
    res.status(200).json({place: place.toObject({getters: true})});
}

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    
    let place;
    try{
        place = await Place.findById(placeId).populate("creator"); //populate => creator holds the full user object
    } catch(err) {
        const error = new HttpError("COuld not delete place", 500);
        return next(error);
    }

    if(!place){
        const error = new HttpError("Could not find place for this ID", 404);
        return next(error);
    }

    if(place.creator.id !== req.userData.userId){
        const error =  new HttpError(
            "Not allowedd to edit this place",
            403
        );
        return next(error); //stop if has error
    }

    const imagePath = place.image;


    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        
        //tim places array cua creator cua place nay
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
        
    } catch(err) {
        const error = new HttpError("Could not delete place", 500);
        return next(error);
    }

    fs.unlink(imagePath, err => { 
        console.log(err);
    });

    res.status(200).json({message: "Delete place."});
}

exports.getPlaceById = getPlaceById; //export a pointer to the getplace func
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
