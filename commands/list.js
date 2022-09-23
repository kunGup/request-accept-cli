const puppeteer = require("puppeteer");
const inquirer = require("inquirer");
let cp = require("child_process");
const config = new (require("conf"))();
const loginLink = "https://www.linkedin.com/login";
const invitationManager =
  "https://www.linkedin.com/mynetwork/invitation-manager/";

let names, links;
let newTab;

async function login() {
  let username = config.get("credentials")?.username;
  let password = config.get("credentials")?.password;
  let headLess = config.get("headLess");
  if (!username || !password) {
    console.log("Provide login credentials first using credentials command.");
    return;
  }
  console.log("Wait we are fetching new requests...");
  let browserWillLaunch = await puppeteer.launch({
    headless: headLess == undefined ? true : headLess,
    args: ["--start-maximized"],
    defaultViewport: null,
  });
  newTab = await browserWillLaunch.newPage();
  await newTab.goto(loginLink);
  await newTab.type("input#username", username, {
    delay: 10,
  });
  await newTab.type("input#password", password, {
    delay: 10,
  });
  await newTab.click("button[type='submit']", { delay: 10 });
}

async function goToInvitationManager() {
  await newTab.waitForSelector(
    "a[href='https://www.linkedin.com/mynetwork/?']"
  );

  await newTab.goto(invitationManager);
  
  try {
    await waitAndClick(
      "#mn-invitation-manager__invitation-facet-pills--CONNECTION",
      newTab
    );
    await newTab.waitForSelector(".invitation-card__container");
  } catch (err) {
    throw 1;
  }

  //finding total no. of invitations
  let connectionsPill = await newTab.$(
    "#mn-invitation-manager__invitation-facet-pills--CONNECTION"
  );
  let attr = await newTab.evaluate(
    (el) => el.getAttribute("aria-label"),
    connectionsPill
  );

  let totalILen = parseInt(attr.split(" ")[1].substr(1, 2));
  console.log(
    `You have ${totalILen} connection request${totalILen > 1 ? "s" : ""}`
  );
    
  let currentILen = await getCInvitationLength()
  while (totalILen - currentILen >= 10) {
    await scrollToBottom();
    currentILen = await getCInvitationLength();
  }
  names = await newTab.$$eval(".invitation-card__title", (nodes) =>
    nodes.map((n) => n.innerText)
  );

  links = await newTab.$$eval(
    ".invitation-card__container>div:first-child>a",
    (nodes) => nodes.map((n) => n.href)
  );
}

async function getCInvitationLength() {
  let currentInvitations = await newTab.$$(".invitation-card__container");
  return currentInvitations.length;
}

async function scrollToBottom() {
  await newTab.evaluate(goToBottom);
  function goToBottom() {
    window.scrollBy(0, window.innerHeight);
  }
}

async function list() {
  try {
    await login();
    await goToInvitationManager();
    displayList();
  } catch (err) {
    if (err == 1) console.log("There are no connection invites currently");
    else console.log("Something went wrong, check internet and try again");
    process.exit();
  }
}

async function waitAndClick(selector, cPage) {
  return new Promise(function (resolve, reject) {
    (async function () {
      try {
        await cPage.waitForSelector(selector, { timeout: 10000 });
        await cPage.click(selector, { delay: 50 });
        resolve();
      } catch (err) {
        reject();
      }
    })();
  });
}

async function acceptAll() {
  return new Promise(function (resolve, reject) {
    (async function () {
      try {
        //first waits for the buttons to load
        await newTab.waitForSelector(
          ".invitation-card__action-container>button:nth-of-type(2)",
          { timeout: 10000 }
        );
        let acceptButtons = await newTab.$$(
          ".invitation-card__action-container>button:nth-of-type(2)"
        );
        for (let i = 0; i < acceptButtons.length; i++) {
          await acceptButtons[i].click({ delay: 50 });
        }
        resolve();
      } catch (err) {
        reject();
      }
    })();
  });
}

function displayList() {
  let arr = names.map((name, i) => {
    return {
      name: name,
      link: links[i],
    };
  });
  inquirer
    .prompt([
      {
        type: "list",
        name: "selection",
        message: "Choose one of the following:",
        choices: [...names, "Accept All", "Exit"],
      },
    ])
    .then(async function (answer) {
      if (answer.selection == "Exit") {
        console.log("Application closed");
        process.exit();
      }
      if (answer.selection == "Accept All") {
        try {
          await acceptAll();
          console.log("All connection requests accepted\nApplication closing");
          process.exit();
        } catch (err) {
          console.log("Something went wrong try again");
          displayList();
        }
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].name == answer.selection) {
          displayPersonList(i);
          break;
        }
      }
    });
}

function displayPersonList(idx) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "selection",
        message: "Menu:",
        choices: ["Accept", "Open profile", "Go back", "Exit"],
      },
    ])
    .then(async function (answer) {
      if (answer.selection == "Accept") {
        try {
          await requestAccepeter(newTab, links[idx]);
          console.log(
            "Connection request accepted\nGoing back to main menu..."
          );
          links.splice(idx, 1);
          names.splice(idx, 1);
          displayList();
        } catch (err) {
          if (err === "Already accepted") {
            console.log(err);
            links.splice(idx, 1);
            names.splice(idx, 1);
            displayList();
          } else {
            console.log("Something went wrong try again");
            displayPersonList(idx);
          }
        }
      } else if (answer.selection == "Open profile") {
        cp.execSync(`start chrome ${links[idx]}`);
        console.log("Profile page opened");
        displayPersonList(idx);
      } else if (answer.selection == "Go back") {
        console.log("Going back");
        displayList();
      } else if (answer.selection == "Exit") {
        console.log("Application closed");
        process.exit();
      }
    });
}

async function requestAccepeter(page, link) {
  return new Promise(function (resolve, reject) {
    (async function () {
      try {
        await page.goto(link);
        await waitAndClick(
          ".pvs-profile-actions__action.artdeco-button.artdeco-button--2.artdeco-button--primary:nth-of-type(2)",
          page
        );
        resolve();
      } catch (err) {
        reject("Already accepted");
        // console.log(err);
      }
    })();
  });
}

module.exports = list;
