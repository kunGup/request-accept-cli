#! /usr/bin/env node
const { program } = require("commander");
let cred = require("./commands/cred");
let list = require("./commands/list");
let toggle = require("./commands/toggle");
program
  .command("credentials")
  .description("Allow to set login credentials")
  .action(cred);
program
  .command("list")
  .description("List all connection requests")
  .action(list);
program
  .command("toggle-mode")
  .description("Toggles between headless and non-headless mode")
  .action(toggle);
program.parse();
