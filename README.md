# AfterClass API

Node.js and Express starter for the AfterClass coursework back-end.

## Local setup

Install dependencies with `npm install`. Copy `.env.example` to `.env` if you need to change the default port or allowed front-end origin.

Run `npm run dev` for development with automatic restart on source changes, or `npm start` to run without watch mode.

Open `http://localhost:3000/` to check the starter route. It returns:

```json
{ "message": "AfterClass API is running" }
```

## Atlas connection and lessons

Copy `.env.example` to `.env`, then replace `MONGODB_URI` with your Atlas Node.js driver connection string and database-user credentials. Keep `MONGODB_DB=afterclass`. Never commit `.env` or share its contents. The example URI is a placeholder; use the hostname and options supplied by Atlas. Percent-encode special characters in URI credentials.

Allow your current IP in Atlas network access and give the database user read/write access to `afterclass`. Restart the server after changing `.env`.

The server connects using one native MongoDB client before listening. Missing or invalid connection settings prevent startup. `GET http://localhost:3000/lessons` returns the contents of the singular `lesson` collection as a JSON array, or a JSON error with HTTP 500 if retrieval fails.

### Manual verification

1. Start the server and confirm the Atlas connection message.
2. In Postman, create a GET request to `http://localhost:3000/lessons`.
3. Check HTTP 200 and 10 lessons with the expected topic, location, numeric price and numeric space values. Initially every space value should be 5. ObjectIds are returned as string IDs in the API JSON.
4. Save the request as `Get all lessons` in an `AfterClass API` collection.

Order creation and lesson update routes will be added next. The Atlas connection and GET route still require local verification with your private configuration.
