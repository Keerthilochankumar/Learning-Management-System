/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");
const { ensureLoggedIn } = require("connect-ensure-login");

let server, agent;

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/signin");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/signin").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("learning management system testing", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/signup").send({
      firstname: "fname",
      lastname: "lname",
      email: "user.a@test.com", // Ensure this user exists in your database
      password: "hashedPassword",
      title: "user",
      _csrf: csrfToken, // Fix typo here
    });
    expect(res.statusCode).toBe(200);
  });

  test("Sign out", async () => {
    let res = await agent.get("/logout");
    expect(res.statusCode).toBe(200);
  });

  test("Creates a course", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "hashedPassword"); // Use correct credentials
    const res = await agent.get("/createcourses");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/createcourses").send({
      coursetitle: "test",
      coursecontent: "test content",
      userId: 1,
      _csrf: csrfToken, // Fix typo here
    });
    expect(response.statusCode).toBe(200);
  });

  test("create a chapter", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "hashedPassword"); // Use correct credentials
    let res = await agent.get("/chapters/createchapters/1"); // Assuming 1 is a valid course ID
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/chapters/createchapters/1").send({
      chname: "chapter",
      chcontent: "description",
      courseId: 1,
      _csrf: csrfToken, // Fix typo here
    });
    expect(response.statusCode).toBe(200);
  });

  test("create a page", async () => {
    const agent = request.agent(server);
    await login(agent, "user.a@test.com", "hashedPassword"); // Use correct credentials
    let res = await agent.get("/chapters/createpages/1"); // Assuming 1 is a valid chapter ID
    let csrfToken = extractCsrfToken(res);
    const response = await agent.post("/chapters/createpages/1").send({
      pgtitle: "pgtitle",
      pgcontent: "pgcontent",
      chapterId: 1,
      _csrf: csrfToken, // Fix typo here
    });
    expect(response.statusCode).toBe(200);
  });
});