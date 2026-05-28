// Patches app.sp via prompts. Usage: node patch-app-sp.js [path]
const fs = require("fs");
const readline = require("readline");

const path = process.argv[2] || "app.sp";
const buf = fs.readFileSync(path);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((res) => rl.question(q, res));
const yes = (a) => /^y(es)?$/i.test(a.trim());

const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const unlockCostumes = () => {
  // Costume fields = indices 22-25 (byte offsets 88-100 inclusive)
  for (let off = 88; off <= 100; off += 4) buf.writeInt32LE(1, off);
};

(async () => {
  let costumesDone = false;
  const moneyWarn = `${RED}WARNING: this also unlocks all costumes.${RESET}`;
  if (yes(await ask(`Set money to 999,999? ${moneyWarn} (y/n) `))) {
    buf.writeInt32LE(999999, 4);
    unlockCostumes();
    costumesDone = true;
  }
  if (!costumesDone && yes(await ask("Unlock All Costumes? (y/n) "))) {
    unlockCostumes();
  }
  if (yes(await ask("Unlock All Album images? (y/n) "))) {
    // Album fields = indices 5-21 (byte offsets 20-87 inclusive)
    for (let off = 20; off <= 84; off += 4) buf.writeInt32LE(1, off);
  }

  fs.writeFileSync(path, buf);

  const vals = [];
  for (let i = 0; i < buf.length; i += 4) vals.push(buf.readInt32LE(i));
  console.log("Patched:", vals.join(", "));
  rl.close();
})();