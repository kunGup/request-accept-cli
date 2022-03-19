# request-accept-cli

> CLI for accepting [LinkedIn](https://linkedin.com) connection requests driven by headless chrome.
## Install

```bash
npm install -g request-accept-cli
```

## Usage

```bash
    Usage: index [options] [command]

    Options:
        -h, --help      display help for command

    Commands:
        credentials     Allow to set login credentials
        list            List all connection requests
        toggle-mode     Toggles between headless and non-headless mode
        help [command]  display help for command

```

## Features

-   List all new connection requests from people.
-   For each person there are 2 options- "Accept" and "Open profile".
-   Can accept all requests in one go.
-   Toggle between headless and non-headless mode to see automation in action.
-   Login credentials will be saved into a default config file so no need to type username and password again.

## Tech used
[node.js](https://nodejs.org/en/),
[puppeteer](https://www.npmjs.com/package/puppeteer),
[conf](https://www.npmjs.com/package/conf),
[commander](https://www.npmjs.com/package/commander),
[inquirer](https://www.npmjs.com/package/inquirer)
## License
MIT © [Kunal Gupta](https://github.com/kunbeg)
