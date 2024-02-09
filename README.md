# CSYE6225 Web API Server

[![CI](https://github.com/marlapativ/webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/marlapativ/webapp/actions/workflows/ci.yml)

CSYE6225 Web API Server Implementation

---

## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.

### Node

- #### Node installation on Windows

Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

    You can install nodejs and npm easily with apt install, just run the following commands.

    $ sudo apt install nodejs
    $ sudo apt install npm

- #### Other Operating Systems

  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    npm install npm -g

### Install npm dependencies

    cd project_folder
    npm install

### Setting up environment
  
  1. You will find a file named `.env.example` on root directory of project.
  2. Create a new file by copying and pasting the file and then renaming it to just `.env`
      cp .env.example .env
  3. The file `.env` is already ignored, so you never commit your credentials.
  4. Change the values of the file to your environment. Helpful comments added to `.env.example` file to understand the constants.

## How to run

### Running API server locally

    npm run dev

You will know server is running by checking the output of the command `npm run start`

    [2024-01-28 12:04:08 PM] info:  Server listening on port 8080

**Note:** `8080` will be your `PORT_NUMBER` from .env

### Running API on production

Build the application using the following command.
This would generate a folder called dist in the current directory

    npm run build

To serve the node application, use the following command

    npm start

**Note:** Make sure the `.env` file in the dist folder is setup with required properties else the default properties are loaded

To serve the node application using pm2, use the following command

    npm run start:pm2

**Note:** Requires pm2 to be globally installed

    npm i -g pm2

## Tests

### Running Test Cases

    npm test

## Lint

### Running Eslint

    npm run lint

To automatically fix lint errors, use the following command

    npm run lint:fix

## Database Commands - Additional info

### Stop PostgreSQL database

Login as admin user to access the directory

    sudo su postgresql
    pg_ctl stop -D {PATH_TO_POSTGRES_DATA}

For Mac OS Users with non-brew installation

    sudo su postgresql
    cd /Library/PostgreSQL/16/bin/
    pg_ctl stop -D ../data

### Start PostgreSQL database

    sudo su postgresql
    pg_ctl start -D {PATH_TO_POSTGRES_DATA}

For Mac OS Users with non-brew installation

    sudo su postgresql
    cd /Library/PostgreSQL/16/bin/
    pg_ctl start -D ../data
