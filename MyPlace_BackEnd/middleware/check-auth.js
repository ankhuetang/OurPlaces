const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error");

module.exports = (req, res, next) =>{
    if(req.method === "OPTIONS"){
        return next();
    }
    try{
        //extract token from headers of an incoming request
        const token = req.headers.authorization.split(' ')[1]; //Authorization: "Bearer TOKEN"
        if(!token){
            throw new Error("Authentication failed")
        } 
        //validate the request
        
        const decodedToken = jwt.verify(token, process.env.JWT_KEY );
        
        //add data to the request. store userId inside userData object of the request
        req.userData = {userId: decodedToken.userId}
        next();
    }
    catch(err){
        const error = new HttpError("Authentication failed", 401);
        return next(error);
    }
    
}
 