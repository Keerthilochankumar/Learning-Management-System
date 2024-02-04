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
const { User,Pages,Courses,Chapters,Enroll } = require("./models"); 
const connnectEnsureLogin = require("connect-ensure-login");
const { request } = require("express");
const courses = require("./models/courses");
const { where } = require("sequelize");
const { lstat } = require("fs");
const saltRounds = 10;
app.use(flash());
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
      const data = await User.findOne({ where: { email: email } });

      if (!data || !await bcrypt.compare(password, data.password)) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
     return done(null,data);
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

app.get("/createcourses",connnectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
return response.render("createcourse",{csrfToken: request.csrfToken()})
})


app.get("/createchapter:id",(req,res)=>{
  const id = req.params.id;
return res.render("createchapter",{csrfToken: req.csrfToken(),
  id:id})
})

app.get("/Educator-dashboard",connnectEnsureLogin.ensureLoggedIn(),async(request,response)=>{
    const users=request.user;
    const existingCourses = await Courses.findAll({where:{ userId:users.id}});
    let temp =[]
    for( i=0;i<existingCourses.length;i++){
      let obj = {
      id : existingCourses[i].dataValues.id,
      courseTitle: existingCourses[i].dataValues.coursetitle,
      courseContent: existingCourses[i].dataValues.coursecontent
    }
    temp.push(obj);
  }
  console.log(temp)
return response.render("Educatordashboard",{ 
         title: `${users.firstname} - teacher Dashboard`,
         courses: temp,
         csrfToken: request.csrfToken()})
});

app.get("/student-dashboard",(request,response)=>{
return response.render("",{csrfToken: request.csrfToken()})
})

app.post("/signin",
 passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
    (request, response) => {
       const auth = request.user;
    if ( auth.title === "Educator") {
      response.redirect("/Educator-dashboard");
    } else if (auth.title === "Student") {
      response.redirect("/student-dashboard");
    } else {
      response.redirect("/login");
    }
  },
);


app.post("/signup", async (request, response) => {
  const { fname, lname, email, password,user } = request.body;
  if (!user) { 
    request.flash("error please try again"," Designation can not be empty!");
    return response.redirect("/signup");
  }
  if (email.length == 0) {
    request.flash(" error please try again","Email can not be empty");
    return response.redirect("/signup");
  }
  if (fname.length == 0) {
    request.flash(" error please try again","First name cannot be empty");
    return response.redirect("/signup");
  }
  if (lname.length == 0) {
    request.flash(" error please try again","Last name cannot be empty");
    return response.redirect("/signup");
  }
  if (password.length < 8) {
    request.flash(" error please try again","Password must be at least 8 characters long");
    return response.redirect("/signup");
  }
  try {
        console.log("khli:",user);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      firstname: fname,
      lastname: lname,
      email: email,
      password: hashedPassword,
      title:user
    });
    return response.redirect("/signin");
  } catch (error) {
    console.log(error);
  }
});



app.post("/createcourses",connnectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
  const {coursetitle,coursedes}= request.body;
  if (coursetitle.length == 0) {
      request.flash("error", "Course name cannot be empty!");
      return response.redirect("/Educator-dashboard");
    }
    if (coursedes.length == 0) {
      request.flash("error", "Description cannot be empty!");
      return response.redirect("/Educator-dashboard"); 
    }
    try {
      await Courses.create({
        coursetitle:coursetitle ,
        coursecontent:coursedes,
        userId: request.user.id,
      });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);



app.post("/createchapter",connnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
  const courseId = request.body.id;
    try {
      await Chapters.create({
        chName: request.body.chapter,
        chcontent: request.body.description,
        courseId,
      });
      response.redirect();
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);


app.get("/logout", (request, response) => {
   request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

module.exports = app;