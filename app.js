const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var csrf = require("tiny-csrf");
var cookieParser=require("cookie-parser");

const passport=require('passport');
const connectEnsureLogin=require('connect-ensure-login');
const session=require('express-session');
//const LocalStrategy=require('passport-local');
const bcrypt=require('bcrypt');
const path = require("path");
const flash=require("connect-flash");
const { constants } = require("buffer");
const {User} = require("./models");
const { response } = require("express");

const saltRounds=10;
app.use(flash());

app.set("views",path.join(__dirname,"views"));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.use(session({
  secret: "my-super-secret-key-66498466848",
  cookie:{
    maxAge:24*60*60*1000,
  },
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.serializeUser((user,done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id)
});

passport.deserializeUser((id,done)=>{
  User.findByPk(id)
  .then(user=>{
    done(null,user)
  })
  .catch(error=>{
    done(error,null)
  })
});

app.get("/",(request,response)=>{
  return response.render("index",{
 csrfToken:request.csrfToken()})
});


app.get("/reg",(request,response)=>{
  return response.render("registration",{
 csrfToken:request.csrfToken()})
});


app.get("/signin",(request,response)=>{
  return response.render("signin",{
 csrfToken:request.csrfToken()})})




app.post("/signin1",async(request,response)=>{
const email=request.body.email;
const password=request.body.password;
console.log(email,password);
try {
  const val = await User.findOne({ where: {
        email:email, 
        password:password, 
    }});
   console.log(val);
  if(val){
   return response.render("test",{
   csrfToken:request.csrfToken()})}
else{return response.render("index",{ csrfToken:request.csrfToken()})
}
  } catch (error) {
    console.log(error);
    return response.render("index",{ csrfToken:request.csrfToken()}).status(422).json(error);
}
})
app.get("/crtch",(request,response)=>{
 return response.render("createcourse",{
csrfToken:request.csrfToken()})
});
app.post("/educator",async(request,response)=>{
const fname= request.body.fname;
const lname= request.body.lname;
const email = request.body.email;
const password= request.body.password;
const user= "educator";
console.log(fname,lname,email,password);
try {
    await User.create({
        firstname:fname,
        lastname:lname, 
        email:email, 
        password:password, 
        user:user
    });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);}
return response.render("index",{csrfToken:request.csrfToken()})
});
app.post("/createcourses",(request,response)=>{
   const coursetitle=request.body.coursetitle;
   console.log("from createcourse:",coursetitle);
return response.render("createchapter",{
 csrfToken:request.csrfToken()})
});


module.exports = app;
// test -> user page after login
//signin -> user signin page
//registration -> user regestration page
// index -> signup and signin page
//  table name->Course
//eduId -> educator id
// crsID -> cours id
// crsname -> cours name
//chID -> chapter id