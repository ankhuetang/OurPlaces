const { validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");

const HttpError = require('../models/http-error');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password'); //find with no condition, query excludes password
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { name, email, password } = req.body;

  //check if user already exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try{
    hashedPassword = await bcrypt.hash(password, 12); //password & length of hash
  } catch(err){
    const error = new HttpError("Could not hash user, try again", 500);
    return next(error);
  }
  
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  let token;
  try{
    token = jwt.sign( //data, private key, other options
    {userId: createdUser.id, email: createdUser.email},
    process.env.JWT_KEY, 
    {expiresIn: "1h"}
  );
  } catch(err){
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
  

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, please try again later.',
      500
    );
    return next(error);
  }

  //could not find user
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  //check password
  let isValidPassword = false;
  try{
    isValidPassword = await bcrypt.compare(password, existingUser.password); //compared entered password w the hashed password
  } catch(err){
    const error = new HttpError("Could not login", 500);
    return next(error);
  }

  //checl password co valid ko
  if(!isValidPassword){
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  let token;
  try{
    token = jwt.sign( //data, private key, other options
    {userId: existingUser.id, email: existingUser.email},
    process.env.JWT_KEY, //login &signup must have same key
    {expiresIn: "1h"}
  );
  } catch(err){
    const error = new HttpError(
      'Signing in failed, please try again later.',
      500
    ); 
    return next(error);
  }
  
//return the token and other infos like id
  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;







   

