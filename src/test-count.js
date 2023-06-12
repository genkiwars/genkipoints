const fs = require("fs");

const count = fs.readFileSync("count.json").toString();
console.log(parseInt(count));

fs.writeFile("count.json", (parseInt(count) + 1).toString(), (err) => {});


