const config = new (require("conf"))();
function toggle() {
  let headLess = config.get("headLess");
  if (headLess == undefined) {
    headLess = false;
  } else {
    headLess = !headLess;
  }
  config.set("headLess", headLess);
}
module.exports = toggle;
