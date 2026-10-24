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

The user has confirmed the Atlas connection and GET route work in Postman. Lesson updates will be added next.

## Create an order

Send `POST http://localhost:3000/orders` with a JSON body:

```json
{
  "name": "Zainab",
  "phone": "07123456789",
  "items": [{ "lessonId": "100000000000000000000001", "quantity": 1 }]
}
```

Expected: HTTP 201 with a confirmation message and `orderId`. Verify the saved record in the `order` collection. Lesson references are stored as ObjectIds and phone numbers as strings to preserve leading zeros.

Manual negative checks: names containing digits, phones containing letters, empty items, quantity 0, malformed IDs and repeated lesson IDs return 400. A well-formed but nonexistent lesson ID returns 404. Quantity 6 for a lesson with 5 spaces returns 409. These requests must not create orders. Save requests in your `AfterClass API` Postman collection.

This route checks current availability and saves the order; the separate coursework PUT request will update lesson spaces afterward. These operations are not an atomic reservation and do not yet prevent concurrent overselling or duplicate retries. Each successful POST creates a new order, so submit the positive test only once. This new route awaits user testing.
