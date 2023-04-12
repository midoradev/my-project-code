const { Embed } = require("guilded.js");
const os = require("node:os");
const prettyMilliseconds = require("pretty-ms");

module.exports = {
  name: "status",
  aliases: ["s"],
  description: "Show the bot status",
  run: async (client, message, args) => {
    let arch = os.arch();
    let platform = os.platform();
    let NodeVersion = process.version;
    let cores = os.cpus().length;
    const totalram = (os.totalmem() / 10 ** 6 + " ").split(".")[0];

    const usedram = ((os.totalmem() - os.freemem()) / 10 ** 6 + " ").split(
      "."
    )[0];
    const usedmem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalmem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const modalcpu = os.cpus().map((i) => `${i.model}`)[0];
    const servers = client.servers.cache.size;
    const users = client.members.cache.size;

    usagePercent(function (err, percent, seconds) {
      let embed = new Embed()
        .setTitle(`Memew's Status | v${require("../package.json").version}`)
        .setColor([231, 229, 229])
        .addField(
          "System",
          `\`\`\`Servers: ${servers}\nUsers: ${users}\nArchitecture: ${arch}\nPlatform: ${platform}\nNode: ${NodeVersion}\nUptime: ${prettyMilliseconds(
            client.uptime
          )}\nLatency: ${Date.now() - message._createdAt}ms\nAPI Latency: ${
            client.ws.ping
          }ms\`\`\``,
          true
        )
        .addField(
          `CPU`,
          `\`\`\`Modal: ${modalcpu}\nSpeed: ${avgClockMHz()}MHz\nUsage: ${percent.toFixed(
            2
          )}%\nCores: ${cores}\nSecond: ${seconds}\`\`\``,
          true
        )
        .setFooter(
          `Memory: ${usedmem}MB / ${totalmem}MB | RAM: ${usedram}MB / ${totalram}MB`
        );
      message.reply(embed);
      if (err) {
        message.reply({
          content: `There is an error :(`,
        });
      }
    });
  },
};
function avgClockMHz() {
  var cpus = os.cpus();
  var totalHz = 0;

  for (var i = 0; i < cpus.length; i++) {
    totalHz += cpus[i].speed;
  }

  var avgHz = totalHz / cpus.length;
  return avgHz;
}
function usagePercent(opts, cb) {
  var cpus = os.cpus();

  var timeUsed;
  var timeUsed0 = 0;
  var timeUsed1 = 0;

  var timeIdle;
  var timeIdle0 = 0;
  var timeIdle1 = 0;

  var cpu1;
  var cpu0;

  var time;

  //opts is optional
  if (typeof opts === "function") {
    cb = opts;
    opts = {
      coreIndex: -1,
      sampleMs: 1000,
    };
  } else {
    opts.coreIndex = opts.coreIndex || -1;
    opts.sampleMs = opts.sampleMs || 1000;
  }

  //check core exists
  if (
    opts.coreIndex < -1 ||
    opts.coreIndex >= cpus.length ||
    typeof opts.coreIndex !== "number" ||
    Math.abs(opts.coreIndex % 1) !== 0
  ) {
    _error(opts.coreIndex, cpus.length);
    return cb(
      'coreIndex "' +
        opts.coreIndex +
        '" out of bounds, ' +
        "should be [0, " +
        (cpus.length - 1) +
        "]"
    );
  }

  //all cpu's average
  if (opts.coreIndex === -1) {
    //take first measurement
    cpu0 = os.cpus();
    time = process.hrtime();

    setTimeout(function () {
      //take second measurement
      cpu1 = os.cpus();

      var diff = process.hrtime(time);
      var diffSeconds = diff[0] + diff[1] * 1e-9;

      //do the number crunching below and return
      for (var i = 0; i < cpu1.length; i++) {
        timeUsed1 += cpu1[i].times.user;
        timeUsed1 += cpu1[i].times.nice;
        timeUsed1 += cpu1[i].times.sys;
        timeIdle1 += cpu1[i].times.idle;
      }

      for (i = 0; i < cpu0.length; i++) {
        timeUsed0 += cpu0[i].times.user;
        timeUsed0 += cpu0[i].times.nice;
        timeUsed0 += cpu0[i].times.sys;
        timeIdle0 += cpu0[i].times.idle;
      }

      timeUsed = timeUsed1 - timeUsed0;
      timeIdle = timeIdle1 - timeIdle0;

      var percent = (timeUsed / (timeUsed + timeIdle)) * 100;

      return cb(null, percent, diffSeconds);
    }, opts.sampleMs);

    //only one cpu core
  } else {
    //take first measurement
    cpu0 = os.cpus();
    time = process.hrtime();

    setTimeout(function () {
      //take second measurement
      cpu1 = os.cpus();

      var diff = process.hrtime(time);
      var diffSeconds = diff[0] + diff[1] * 1e-9;

      //do the number crunching below and return
      timeUsed1 += cpu1[opts.coreIndex].times.user;
      timeUsed1 += cpu1[opts.coreIndex].times.nice;
      timeUsed1 += cpu1[opts.coreIndex].times.sys;
      timeIdle1 += cpu1[opts.coreIndex].times.idle;

      timeUsed0 += cpu0[opts.coreIndex].times.user;
      timeUsed0 += cpu0[opts.coreIndex].times.nice;
      timeUsed0 += cpu0[opts.coreIndex].times.sys;
      timeIdle0 += cpu0[opts.coreIndex].times.idle;

      var timeUsed = timeUsed1 - timeUsed0;
      var timeIdle = timeIdle1 - timeIdle0;

      var percent = (timeUsed / (timeUsed + timeIdle)) * 100;

      return cb(null, percent, diffSeconds);
    }, opts.sampleMs);
  }
}
