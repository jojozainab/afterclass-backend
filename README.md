# AfterClass API

## Enrolment: Phase 10

`GET /enrolment/:lessonid` returns `{"lessonId":"...","enrolment":1}` for an existing lesson. It sums matching item quantities across the `order` collection, using ObjectId references. It does not calculate `5 - space`, since available spaces can be set independently using PUT. Existing lessons with no orders return enrolment 0. Malformed IDs return 400; nonexistent lesson IDs return 404; database failures return 500.

Save a Postman request named Get lesson enrolment. Verify its result by summing quantities for that lesson in Atlas orders, including earlier Postman test orders. Test a purchased lesson, a lesson with no orders, `/enrolment/invalid` (400), and `/enrolment/ffffffffffffffffffffffff` (404, provided that ID is absent). If existing orders include a quantity greater than one, verify that all those slots are counted, rather than one per order. These tests await user execution.

## Teachers: Phase 9

`GET /teachers` returns Atlas teacher records sorted by last and first name. `GET /lessons?teacherId=000000000000000000000001` returns lessons linked to that teacher through ObjectId references. Omitting teacherId still returns all lessons; malformed IDs return 400 and a valid but unmatched ID returns an empty array. Both endpoints await user testing.

## Server-side search: Phase 8

`GET /search?q=...` returns lessons matching literal, case-insensitive substrings in topic, location, price or space. MongoDB performs the filtering: numeric fields are converted to strings inside the query. Empty or whitespace-only search returns all lessons; no matches return an empty array. Query text is limited to 100 characters and regex metacharacters are escaped. Repeated/structured q parameters return 400. Database errors return 500.

Save Postman requests for `/search?q=math`, `/search?q=HEND`, `/search?q=25`, `/search?q=4`, `/search?q=zzzznotfound`, `/search?q=%5B` and `/search?q=`. Compare numeric matches with current Atlas values: a numeric query can match price or availability. Expect 200 arrays, including an empty array for no matches; brackets are literal text, not regex syntax. These checks await user testing.

## Request logging and lesson images

The logger runs before other middleware. Each request produces an incoming log and, on response completion, a log containing the HTTP method, original URL, response status and elapsed milliseconds. Timestamps use UTC. Request bodies and credentials are not logged; do not put secrets in request URLs.

`/images` serves files from `public/images` using Express static middleware with an absolute directory path. A missing image returns HTTP 404 with `{"error":"Lesson image not found."}`.

From Windows Command Prompt in the back-end folder, generate the ten original JPEG lesson title cards with:

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-lesson-images.ps1
```

The execution policy option applies only to this PowerShell process. The script creates missing files and preserves existing images. Commit the resulting JPEGs so they are available on Render without needing PowerShell on the server.

Manual verification: open `/images/mathematics.jpg`, confirm HTTP 200 and `Content-Type: image/jpeg` in Postman, and inspect the image in a browser. Request `/images/not-found.jpg` and verify HTTP 404 with the JSON message. Check the terminal for incoming and completed logs for successful images, missing images and `/lessons`. The user confirmed these checks passed. Also test the other nine lesson image URLs before deployment.

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

This route checks current availability and saves the order; the separate coursework PUT request updates lesson spaces afterward. These operations are not an atomic reservation and do not yet prevent concurrent overselling or duplicate retries. Each successful POST creates a new order, so submit the positive test only once. The user has confirmed successful Postman testing.

## Update lesson attributes

Send `PUT http://localhost:3000/lessons/100000000000000000000001` with a raw JSON body such as:

```json
{ "space": 4, "price": 27 }
```

This sets exact values with `$set` and preserves unspecified fields. It updates topic, location, image, price, space and teacherId, and also supports additional scalar lesson attributes. `_id`, operator keys and dotted paths are rejected. Nested objects, arrays and null are not accepted as lesson attribute values. Teacher IDs are converted to ObjectIds and checked against the teacher collection.

Expected: HTTP 200 with `modifiedCount: 1`. Repeating identical values still returns 200 with `modifiedCount: 0`; that is a successful no-op. Malformed IDs, empty bodies, negative/noninteger spaces, invalid prices and protected attributes return 400. Nonexistent lessons or referenced teachers return 404.

Verify each update with GET `/lessons` and in Atlas. For the one-space Mathematics test order, set space to 4 if that was the only successful order for this lesson. Restore the sample price to 25 after demonstrating arbitrary attribute updates. Do not restore purchased spaces to 5 while retaining the order. The user has confirmed successful PUT testing, including validation and repeated-update checks.
