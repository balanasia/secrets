//jshint esversion:6
////////////Initilizing Frameworks and Packages//////////////
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//use the public folder for data
app.use(express.static("public"));
//use ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

////////////Initilize Mongoose////////////

//connect to the default conneciton for mongoose
mongoose.connect("mongodb://localhost:27017/userDB");

//create mongoose user schema
const userSchema = {
  email: String,
  password: String
};

//create mongoose model to use the user schema
const User = new mongoose.model("User", userSchema);

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

//create a new user
//when new user created, you can see the secret
app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

//log in
//check if the password that the user put in is the same as in the database
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  //search our mongoDB database for the email
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser) {
        //check if the user stored password matches with the input
        if(foundUser.password===password){
          res.render("secrets");
        }
      }
    }
  });


});

app.listen(3000, function(req, res){
  console.log("Server started on port 3000");
});
