const fs = require("fs");
let AsciiTable = require("ascii-table");
let table = new AsciiTable();
table.setHeading("Events", "Stats").setBorder("|", "=", "0", "0");

module.exports = (client) => {
  fs.readdirSync("./events/")
    .filter((file) => file.endsWith(".js"))
    .forEach((event) => {
      require(`../events/${event}`);
      table.addRow(event.split(".js")[0], "✔");
    });
  console.log("\x1b[32m%s\x1b[0m", table.toString());
};
