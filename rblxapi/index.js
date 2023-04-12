const express = require("express");
const path = require("path");
require("dotenv").config();

//Main App
const app = express();
const port = process.env.PORT;
const routerAPI_Games = require("./routes/apiGames");
const routerAPI_Users = require("./routes/apiUsers");
const routerGenerateAPI = require("./routes/apiKey");

const staticPath = path.join(__dirname, "./web");

//API
app.use(express.static(staticPath));
app.use("/games", routerAPI_Games);
app.use("/users", routerAPI_Users);
app.use("/generateApiKey", routerGenerateAPI);
app.use(express.json());

//home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./web/index.html"));
});

//cant get any page -> return to home page
app.get("*", function (req, res) {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running: http://localhost:${port}/`);
});

//npm i dotenv express node-fetch@2
//npm uni dotenv express node-fetch