# AfterClass - Express.js API

**Student number:** M01140312

This repository contains the Node.js/Express back-end of my AfterClass coursework project. It uses the native MongoDB driver to access the lesson, teacher and order collections in MongoDB Atlas.

## Project links

- Vue repository: https://github.com/jojozainab/afterclass-frontend
- Live application: https://jojozainab.github.io/afterclass-frontend/
- Express repository: https://github.com/jojozainab/afterclass-backend
- Live lessons endpoint: https://m01140312-after-school.onrender.com/lessons

## Configuration

The local configuration is held in an ignored `.env` file. `.env.example` contains placeholders. Atlas credentials are kept on the server and are not included in the Vue application.

| Variable          | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `MONGODB_URI`     | Private Atlas connection string                                        |
| `MONGODB_DB`      | Database name, `afterclass`                                            |
| `FRONTEND_ORIGIN` | Allowed browser origin; production uses `https://jojozainab.github.io` |
| `PORT`            | Listening port; Render supplies its production value                   |

Local installation uses `npm ci`. `npm start` starts the server; `npm run dev` watches the source folder for changes. The server connects to Atlas before accepting requests and reuses a single MongoDB client. Atlas network access includes the relevant development IP and Render outbound ranges.

## API routes

| Method | Path                   | Behaviour                                   |
| ------ | ---------------------- | ------------------------------------------- |
| GET    | `/`                    | API status message                          |
| GET    | `/lessons`             | All lessons; optional teacherId filtering   |
| POST   | `/orders`              | Validates and saves an order                |
| PUT    | `/lessons/:id`         | Sets supplied editable lesson attributes    |
| GET    | `/search?q=...`        | Multi-attribute server-side lesson search   |
| GET    | `/teachers`            | Teachers sorted by last name and first name |
| GET    | `/enrolment/:lessonid` | Purchased slot count from order quantities  |
| GET    | `/images/:filename`    | Static image, or JSON error with HTTP 404   |

### Orders

An example POST body is:

```json
{
  "name": "Zainab",
  "phone": "07123456789",
  "items": [{ "lessonId": "100000000000000000000001", "quantity": 1 }]
}
```

Valid requests return HTTP 201 with an order reference. Orders contain the customer name, phone string, lesson ObjectId references, quantities and a creation date. Validation rejects invalid names, phones, IDs, quantities and duplicate item IDs with HTTP 400. Missing lessons return 404 and insufficient spaces return 409.

### Lesson updates

PUT uses `$set` to assign exact attribute values, preserving other fields. For example, `{"space":4,"price":27}` sets those values rather than incrementing or decrementing them. The route supports ordinary scalar attributes and validates existing lesson fields. Teacher references are converted to ObjectIds and checked against the teacher collection.

Protected IDs, operator keys, dotted paths, nested objects, arrays and null attribute values are rejected. Successful updates return HTTP 200. A repeated identical update returns `modifiedCount: 0`; malformed inputs return 400 and missing lessons or teachers return 404.

### Search and teachers

Search matches literal, case-insensitive substrings across topic, location, price and space. Numeric fields are converted to strings in the MongoDB query. Empty searches return all lessons; unmatched searches return an empty array. Regex syntax is escaped, and query text is limited to 100 characters.

Each teacher has a first name, last name and ObjectId. Each lesson has a matching teacherId reference. `GET /lessons?teacherId=000000000000000000000001` returns Sarah Ahmed's lessons. Malformed teacher IDs return 400; unmatched valid IDs return an empty array.

### Enrolment

Enrolment is the sum of purchased quantities for a lesson across the order collection. It is calculated from orders rather than `5 - space`, since available spaces can be updated independently. An example response is:

```json
{ "lessonId": "100000000000000000000001", "enrolment": 1 }
```

Existing lessons with no orders return 0. Malformed lesson IDs return 400; nonexistent lessons return 404.

## Middleware and images

The logger runs before the other middleware. It records incoming requests and completed responses with UTC timestamps, HTTP method, URL, response status and elapsed milliseconds. Request bodies are not logged.

Express static middleware serves `public/images` through `/images`. A missing image returns `{"error":"Lesson image not found."}` with HTTP 404. The ten JPEG title cards were created with the original PowerShell script in `scripts/create-lesson-images.ps1`; the script preserves existing images.

## Data and testing

Initial fixtures contain five teachers and ten lessons with five spaces each. Current Atlas records reflect test bookings. The fixtures in `data/` document the initial state and are distinct from final database exports.

I tested the routes in Postman, checked stored records in Atlas, inspected request logs and verified image delivery and missing-image errors. I tested the deployed API with the GitHub Pages application. Final export and packaging tasks remain part of submission preparation.

## Acknowledgement and limitations

I used ChatGPT for explanations, debugging, deployment guidance and documentation. The final handbook-format declaration remains part of submission preparation.

POST saves an order, while a separate PUT updates availability. These operations are not atomic and can produce inconsistent availability during concurrent checkouts. Repeated successful POST requests create separate orders. The front-end includes an in-memory recovery path for failed PUT requests after an order is saved.
