const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const path = require("path");
const flash = require("connect-flash");
const { User, Course } = require("./models"); 

const saltRounds = 10;
app.use(flash());
const userdetails=[];

app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(express.static(path.join(__dirname, "public")));


app.set("view engine", "ejs");
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET || "my-super-secret-key-66498466848",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
  resave: true,
  saveUninitialized: true,
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id)
  done(null, user.id)
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error, null)
    })
});


passport.use('local', new LocalStrategy(
  { usernameField: 'email' },
  async function (email, password, done) {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }  const name= await user.firstname;
              const eid= await user.eid;
       userdetails.push(name,email,eid);
       console.log("akj;oldhas;k:",userdetails);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));


app.get("/", (request, response) => {
  return response.render("index", { csrfToken: request.csrfToken() });
});

app.get("/signup", (request, response) => {
  return response.render("registration", { csrfToken: request.csrfToken() });
});

app.get("/signin", (request, response) => {
  return response.render("signin", { csrfToken: request.csrfToken() });
});

app.get("/dashboard", (request, response) => {
  return response.render("test", { csrfToken: request.csrfToken() });
});
app.get("/courses/new",(request,response)=>{
return response.render("createcourse",{csrfToken: request.csrfToken()})
})
app.get("/createchapter",(request,response)=>{
return response.render("createchapter",{csrfToken: request.csrfToken()})
})
app.post("/signin",
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/signin',
    failureFlash: true
  }));


app.post("/signup", async (request, response) => {
  const { fname, lname, email, password } = request.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      firstname: fname,
      lastname: lname,
      email: email,
      password: hashedPassword,
      user: "user",
    });
    response.redirect("/signin");
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server Error");
  }
});




app.get("/logout", (request, response) => {
  request.logout();
  response.redirect("/");
  userdetails=[];
});


module.exports = app;