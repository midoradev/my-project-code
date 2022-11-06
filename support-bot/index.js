require('dotenv-flow').config();
const Bot = require('./class/bot');
const client = new Bot();

(async function () {

    await client.registerClient();
    client.login(process.env.BOT_TOKEN);

})();
const express = require('express')
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('Bot is online!'))

app.listen(port, () =>
console.log(`Your app is listening a http://localhost:${port}`)
);