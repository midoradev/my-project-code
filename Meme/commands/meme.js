const { Embed } = require("guilded.js");
const got = require("got");

module.exports = {
  name: "meme",
  aliases: ["m"],
  description: "Give you a random meme from Reddit",
  run: async (client, message, args) => {
    // let reddit = args.join(" ");
    let subreddit = [
      "dankmemes",
      "memes",
      "meme",
      "me_irl",
      "wholesomememes",
      "4chan",
      "animemes",
      "funny",
      "historymemes",
      "prequelmemes",
    ];
    let random = subreddit[Math.floor(Math.random() * subreddit.length)];

    got(`https://www.reddit.com/r/${random}/random/.json`)
      .then(async (response) => {
        const content = JSON.parse(response.body);

        const permalink = content[0].data.children[0].data.permalink;
        const memeUrl = `https://reddit.com${permalink}`;
        const memeImage = content[0].data.children[0].data.url;
        const memeTitle = content[0].data.children[0].data.title;
        const memeUpvotes = content[0].data.children[0].data.ups;
        const memeDownvotes = content[0].data.children[0].data.downs;
        const memeNumComments = content[0].data.children[0].data.num_comments;
        const memeAuthor = content[0].data.children[0].data.author;

        const embed = new Embed()
          .setAuthor(`Posted by u/${memeAuthor}`)
          .setTitle(`${memeTitle}`)
          .setURL(`${memeUrl}`)
          .setImage(memeImage)
          .setColor([231, 229, 229])
          .setFooter(
            `From r/${random} • 👍 ${memeUpvotes} • 👎 ${memeDownvotes} • 💬 ${memeNumComments}`
          );
        message.reply(embed);
        console.log(content[0].data.children[0]);
      })
      .catch("", console.error);
  },
};
