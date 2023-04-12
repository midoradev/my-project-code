const STRING = "abcdef",
NUMBER = "1234567890",
chars = STRING + NUMBER;

module.exports = (length = 32) => {
let pass = "";

while (pass.length < length) pass += chars[Math.floor(Math.random() * chars.length)];

return pass;
}