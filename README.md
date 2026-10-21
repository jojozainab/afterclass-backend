# AfterClass API

Node.js and Express starter for the AfterClass coursework back-end.

## Local setup

Install dependencies with `npm install`. Copy `.env.example` to `.env` if you need to change the default port or allowed front-end origin.

Run `npm run dev` for development with automatic restart on source changes, or `npm start` to run without watch mode.

Open `http://localhost:3000/` to check the starter route. It returns:

```json
{ "message": "AfterClass API is running" }
```

The MongoDB connection and lesson/order routes will be implemented in later phases. The installed `mongodb` package is the native driver required by the coursework.
