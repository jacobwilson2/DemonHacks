var express = require("express");
var socket = require("socket.io");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var bodyParser = require("body-parser");

var app = express();
var server = app.listen(process.env.PORT, process.env.IP, function() {
    console.log("server is running");
});

app.use(bodyParser.urlencoded({extended: true}));

var mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:test123@cluster0-5025x.gcp.mongodb.net/test?retryWrites=true");

app.use(express.static('public'));

app.use(require("express-session")({
    secret: "This should be hidden",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin:test123@cluster0-5025x.gcp.mongodb.net/test?retryWrites=true");

var Schema = mongoose.Schema;

var locationSchema = new Schema(
{
  username: String,
  text: String,  
  location: {
    type: { type: String },
    coordinates: []
  }
});

locationSchema.index({ location: "2dsphere" });

var Location = mongoose.model("location", locationSchema);

module.exports = Location;




app.get("/", function(req, res) {
//     var thisLocation = new Location({
//       username: "phase2",
//       text: "Hello World",
//       location: {
//       type: "Point",
      
//       coordinates: [-87.699172, 42.044148]
//       },
// });

    // Location.create(thisLocation, function(err, location){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         console.log("added tcccco database collection");
    //     }
    // })



// thisLocation.save((err, message) => {
//   if (err) console.log(err);
//   console.log("oh fuck");
//   console.log(message);
// });

    Location.find({}, function(err, theLocation){
        if(err){
            console.log("Database error");
            console.log(err);
        } else {
            res.render("index.ejs", {locations:theLocation})
            //Serves up test.ejs and collects user input
        }
        });
})

app.get("/login", function(req, res) {
    res.render("account.ejs");
})


app.post("/login", passport.authenticate("local", 
{
    successRedirect: "/",
    failureRedirect: "/login"
    
    
}), function(req, res) {
})


app.get("/register", function(req, res) {
    res.render("new_user.ejs")
})

app.post("/register", function(req, res) {
    
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            console.log(err);
            return res.render("new_user.ejs");
        }
        
        passport.authenticate("local")(req, res, function(){
            res.redirect("/login")
        })
    })
})

app.post("/filter", function(req, res) {
    var METERS_PER_MILE = 1609.34
    
    var radius = (req.body.radius * METERS_PER_MILE);
    
    Location.find({
        location: {
            $nearSphere: {
                
                $geometry: {
                        type: "Point",
                        coordinates: [-87.6257907, 41.878647199999996]
                        },
                $maxDistance: (radius)
                }
            }
 }).find((error, results) => {
  if (error) console.log(error);
  console.log(results);
  res.render("index.ejs", {locations:results});
  console.log("Fetching results that are within " + (radius * 10) + " miles");
 });
})


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login");
})

app.get("*", function(req,res){
    res.redirect("/");
})