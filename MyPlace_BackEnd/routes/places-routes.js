const express = require("express");
const {check} = require("express-validator")

const HttpError = require("../models/http-error");
const placeControllers = require("../controllers/places-controller")
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth")

//create router object to export later
const router = express.Router();


//register get middleware
// filter "/" de append vao /apli/places
router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

//add middleware to authorize only requests with token
router.use(checkAuth);

//validate request body data => use check middleware before calling function
router.post("/", 
    fileUpload.single("image"),
[
    check("title").trim().notEmpty(),
    check("description").isLength({min: 5}),
    check("address").trim().notEmpty()
],
    placeControllers.createPlace);

router.patch("/:pid",
[
    check("title").trim().notEmpty(),
    check("description").isLength({min: 5})
] , placeControllers.updatePlaceById);

router.delete("/:pid", placeControllers.deletePlaceById);
//export router object
module.exports = router;
