const fs = require("fs"); //file system module to delete files
const path = require("path");

const express = require("express");
const HttpError = require("./models/http-error");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


//import from other files
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app= express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")))//return respons to requests to this file path

app.use((req, res, next)=> {
    res.setHeader("Access-Control-Allow-Origin", '*'); //grant access to any frontend domain
    res.setHeader(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
})

//path filter /api/places de chi load nhung routes co base nnay
app.use("/api/places",placesRoutes);
app.use("/api/users", usersRoutes);

//handling for unsupported route
app.use((req, res, next)=> {
    const error = new HttpError("Could not find this route", 404);
    throw error;
});

//special midleware w 4 params to catch error
app.use(( error,req, res ,next) => {
    if(req.file){
        fs.unlink(req.file.path, (err)=> {
            console.log(err);
        }) //delete file
    }
    //check xem error dc tu dong sent trong header chua
    if(res.headerSent){ //if response header is sent
        return next(error); //continue to next one after return
    }
    res.status(error .code || 500);

    res.json({message: error.message || "An unknown error occured"})
})

mongoose
// .connect(`mongodb+srv://ankhuetang03:ankhuetang@cluster0.eio9jaw.mongodb.net/mern?retryWrites=true&w=majority`)
    // .connect(`mongodb+srv://${db_username}:${db_password}@cluster0.eio9jaw.mongodb.net/${db_name}?retryWrites=true&w=majority`)
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.eio9jaw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(()=> {
        app.listen(process.env.PORT || 5000); //if connection to database successful, start server
    })
    .catch(err => {
        console.log(err); 
    }); 
