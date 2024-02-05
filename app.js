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


app.get("/changePassword", (request, reponse) => {
  const Userdetail = request.user;
  reponse.render("Passwordchange", {
    title: "Change Password",
    Userdetail,
    csrfToken: request.csrfToken(),
  });
});


app.get("/createcourses",connnectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
return response.render("createcourse",{csrfToken: request.csrfToken()})
})


app.get("/chapters/createchapters/:id",connnectEnsureLogin.ensureLoggedIn(),(request,response)=>{
  const id = request.params.id;
  console.log(id);
return response.render("createchapter",{csrfToken: request.csrfToken(),
  id:id})
})


app.get("/chapters/createpages/:id",(request,response)=>{
const id= request.params.id;
console.log(id);
return response.render("createpages",{  csrfToken: request.csrfToken(),
  id:id})
});
app.get("/student/:userid/course/:id",async(request,response)=>{
const courseid= request.params.id;
const userid= request.params.userid;
const coursedetails = await Courses.findOne({where:{id:courseid}});
const user= await User.findOne({where:{id:coursedetails.userId}})
console.log("duyfuavjtfgiaukvujbukj",userid);
return response.render("enroll",{  csrfToken: request.csrfToken(),
  userid:userid,
  courseid:courseid,
  course:coursedetails,
   user:user})
});

app.get("/chapters/:id",async (request, response)=>{
  const id = request.params.id;
  console.log(id);
  const val = await Courses.findByPk(id);
  const title = val.dataValues.coursetitle;
  const data = await Chapters.findAll({where:{courseId:id}})
  let temp = [];
  for(i =0;i<data.length;i++){
    let obj= {
      id : data[i].dataValues.id,
      chname: data[i].dataValues.chname,
      chcontent : data[i].dataValues.chcontent,
    }
    temp.push(obj);
}
  return response.render("displaychapters",{csrfToken: request.csrfToken(),
  id:id,
  chapters:temp,
  title:title
  }) 
})


app.get("/chapter/pages/:id",async(request,response)=>{
const id = request.params.id;
  console.log(id);
  const val = await Chapters.findByPk(id);
  const title = val.dataValues.chname;
  const data = await Pages.findAll({where:{chapterId:id}})
  let temp = [];
  for(i =0;i<data.length;i++){
    let obj= {
      id : data[i].dataValues.id,
      pgtitle: data[i].dataValues.pgtitle,
      pgcontent : data[i].dataValues.pgcontent,
    }
    temp.push(obj);
}
  return response.render("displaypages",{csrfToken: request.csrfToken(),
  id:id,
  pages:temp,
  title:title
  }) 
});


app.get("/Educator-dashboard",connnectEnsureLogin.ensureLoggedIn(),async(request,response)=>{
    const users=request.user;
    const existingCourses = await Courses.findAll({where:{userId:users.id}});
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


app.post("/signin",
 passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
    (request, response) => {
       const auth = request.user;
    if ( auth.title === "Educator") {
      response.redirect("/Educator-dashboard");
    } else if (auth.title === "student") {
      response.redirect("/student-dashboard");
    } else {
      response.redirect("/signin");
    }
  },
);
app.get("/logout", (request, response) => {
   request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/index");
  });
});


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
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.create({
      firstname: fname,
      lastname: lname,
      email: email,
      password: hashedPassword,
      title:user
    });
    return response.redirect("/signin").status(200);
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
     return response.redirect("/Educator-dashboard")
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);


app.post("/createchapter",connnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    console.log(request.body.chapter , request.body.description , request.body.id)
    try {
      await Chapters.create({
        chname: request.body.chapter,
        chcontent: request.body.description,
        courseId:request.body.id,
      });
      const url = "/chapters/"+request.body.id;
      response.redirect(url);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);


app.post("/createpages",connnectEnsureLogin.ensureLoggedIn(),async (request, response) => {
    console.log(request.body.pgtitle , request.body.pgcontent, request.body.id)
    try {
      await Pages.create({
        pgtitle: request.body.pgtitle,
        pgcontent: request.body.pgcontent,
        chapterId: request.body.id
      });
      const url = "/chapter/pages/"+request.body.id;
      response.redirect(url);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);


app.get("/student-dashboard",async(request,response)=>{
const users=request.user;
    const existingCourses = await Courses.findAll();
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
return response.render("studentDashboard",{ 
         title: `${users.firstname} - student Dashboard`,
         courses: temp,
         userid: users.id,
         csrfToken: request.csrfToken()})
});



app.get("/student/:userid/course/:id",async(request,response)=>{
const id = request.params.id;
const userid= request.params.userid;
  console.log(id);
  console.log(userid);
  const val = await Courses.findByPk(id);
  const title = val.dataValues.coursetitle;
  const data = await Chapters.findAll({where:{courseId:id}})
  let temp = [];
  for(i =0;i<data.length;i++){
    let obj= {
      id : data[i].dataValues.id,
      chname: data[i].dataValues.chname,
      chcontent : data[i].dataValues.chcontent,
    }
    temp.push(obj);
}
  return response.render("chapters",{csrfToken: request.csrfToken(),
  id:id,
  userid:userid,
  chapters:temp,
  title:title
  })
})

app.post("/enroll",async (request,response)=>{
const user_id = request.body.userid;
const course_id= request.body.id;
    const existingEnrollment = await Enroll.findOne({
      where: { userid: user_id,courseid: course_id },
    });
    if (existingEnrollment) {
      return response.status(400).json({ message: "You are already enrolled in this course." });
    }
   else{
    await Enroll.create({
      userid: user_Id,
      courseid:course_id
    });
   }
    response.redirect("/student-dashboard");
  }
);


app.post("/changePassword", async (request, response) => {
  const userEmail = request.body.email;
  const newPassword = request.body.password;
  const oldpassword= request.body.oldpassword;
  try {
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      request.flash("error", "User with that email does not exist.");
      return response.redirect("/index");
    }
    else if( newPassword==oldpassword){
        request.flash("error","the new password is same as old password");
        return response.redirect("/index");
         }
    const hashedPwd = await bcrypt.hash(newPassword, saltRounds);
    await user.update({ password: hashedPwd });
    if (user.title === "Educator") {
      return response.redirect("/Educator-dashboard");
    } else {
      return response.redirect("/student-dashboard");
    }
  } catch (error) {
    console.log(error);
    return response.redirect("/index");
  }
});

module.exports = app;