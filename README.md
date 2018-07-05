![banner](https://user-images.githubusercontent.com/1245814/32835095-6b7ca8d8-c9ca-11e7-9645-9879058ea40f.jpg)

# Lighthouse Message

Services API for sending messages and group or private conversation
---

#### Configurations

You need to have an active mongodb instance with a database called ```lighthouse_message```

Create a .env file with the following fields:
```
MONGO_URI=mongodb://localhost/lighthouse_message
```

#### Install

To install the project dependencies, just enter the folder and run npm install

```
$ cd server/api

$ npm install
```

#### Running mocha tests on message api

To run the tests first we need to start the project and then run the test

```
$ npm start
```

```
$ npm run test-local
```

### Checking code quality with eslint 

To test the quality of the code, we can run the tests with *eslint*

```
$ npm run eslint
```
