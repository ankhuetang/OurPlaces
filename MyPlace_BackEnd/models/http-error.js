class HttpError extends Error {
    constructor(message, errorCode) {
        //super to call contructor of the base class
        super(message); //Add a "message property"
        this.code = errorCode; //Add a "code" prop
    }
}

module.exports = HttpError;