const config = new (require("conf"))();
const puppeteer = require("puppeteer");
const inquirer = require("inquirer");
const loginLink = "https://www.linkedin.com/login";
function cred() {
  inqureCred();
}

function inqureCred() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "username",
        message: "Enter linkedIn username: ",
      },
      {
        type: "password",
        name: "password",
        mask: "*",
        message: "Enter linkedIn password: ",
      },
    ])
    .then(async function (answer) {
      await isCorrect(answer);
      process.exit();
    });
}

async function isCorrect(answer) {
  try {
    let email = answer.username;
    let password = answer.password;
    let browserWillLaunch = await puppeteer.launch({
      headless: true,
      args: ["--start-maximized"],
      defaultViewport: null,
    });
    newTab = await browserWillLaunch.newPage();
    await newTab.goto(loginLink);
    await newTab.type("input#username", email, {
      delay: 100,
    });
    await newTab.type("input#password", password, {
      delay: 100,
    });
    await newTab.click("button[type='submit']", { delay: 50 });
    await newTab.waitForSelector("a[data-link-to='mynetwork']", {
      timeout: 10000,
    });
    config.set("credentials", answer);
    console.log("Credentials set succesfully");
  } catch (err) {
    console.log("Provide correct credentials");
  }
}

module.exports = cred;
