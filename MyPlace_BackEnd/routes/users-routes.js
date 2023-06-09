const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;


















// const express = require("express")
// const {check} = require("express-validator")

// const usersControllers = require("../controllers/users-controller")
// const fileUpload = require("../middleware/file-upload")

// //create router object to export later
// const router = express.Router();


// //register get middleware
// // filter "/" de append vao /apli/places
// router.get("/", usersControllers.getUsers);

// router.post("/signup",
// fileUpload.single('image'), //extract a single file on the incoming request
// [
//     check("name").not().isEmpty(),
//     check("email").normalizeEmail().isEmail(),
//     check("password").isLength({min: 6})
// ] ,usersControllers.signup);

// router.post("/login", usersControllers.login);


// //export router object
// module.exports = router;