const { Client } = require("discord.js");
const { token } = require("./config/tsconfig.json");
const client = new Client({intents: 32767});

client.once("ready", () => {
    console.log("Your Bot Is Online!");
    client.user.setActivity("Hello World!", {type: "WATCHING"})
});

client.login(token);