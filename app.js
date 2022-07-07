//jshint esversion:6
////////////Initilizing Frameworks and Packages//////////////
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

//use the public folder for data
app.use(express.static("public"));
//use ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//express-sessiion initilizing
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//initilize Passport
app.use(passport.initialize());
app.use(passport.session());

////////////Initilize Mongoose////////////

//connect to the default conneciton for mongoose
mongoose.connect("mongodb://localhost:27017/userDB");

//create mongoose user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//initilize plug-in for Mongoose schema
//this is used to hash and salt the passwords
userSchema.plugin(passportLocalMongoose);

//create mongoose model to use the user schema
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////Routes////////////////
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

//checks if the user has been authenticated
//if not authenticated, redirect to the login page
app.get("/secrets", function(req, res){
  if(req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("logout", function(req, res){
  req.logout();
  res.redirect("/");
})

//create a new user
//when new user created, you can see the secret
app.post("/register", function(req, res){
  //create a new user using the Passport package
  User.register({username: req.body.username},req.body.password, function(err, user){
    //if error occurs, log the error
    //and redirect the user back register page
    if(err){
      console.log(err);
      res.redirect("/register");
    } else {
      //authenticate the local user and generate a cookie
      passport.authenticate("local")(req, res, function(){
        //display the secrets page once the user is authenticated
        res.redirect("/secrets");
      });
    }
  });
});

//log in
//check if the password that the user put in is the same as in the database
app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  //pass in the new user info
  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        //display the secrets page once the user is authenticated
        res.redirect("/secrets");
      });
    }
  });

});

app.listen(3000, function(req, res){
  console.log("Server started on port 3000");
});
