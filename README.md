# Discord Bot Starter in Node.JS

## Features
- Send image from scrolller.com

## Prerequisites
#### Optimize for VSCode
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org) & [npm](https://www.npmjs.com/)
- [Yarn](https://yarnpkg.com)

### Setup (before anything else)
```bash
$ yarn install
# You also need to set some vars in .env file, you could also use export
$ echo "DISCORD_TOKEN={YOUR_MAGIC_TOKEN}" > .env
```

### Build
```bash
$ yarn build #or run Build Task in VSCode
```

### ESLint
```bash
$ yarn lint
```

### Launch in Dev (w/ nodemon)
```bash
$ yarn start #build automatically before starting
```

<!--### Test
```bash
$ yarn test #or run Test Task in VSCode
```-->