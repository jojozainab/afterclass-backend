# Initial Atlas data

Use these files only for the initial population of the empty `afterclass` database:

- `teachers.json` goes into the singular `teacher` collection (5 documents).
- `lessons.json` goes into the singular `lesson` collection (10 documents).
- Leave `order` empty until booking tests.

These are MongoDB Extended JSON files. `$oid` represents a MongoDB ObjectId. Import using an Extended JSON-aware tool such as Atlas Data Explorer or MongoDB Compass; plain `JSON.parse()` alone does not convert these wrappers to ObjectIds.

Each lesson's `teacherId` matches a teacher `_id`. Each teacher teaches two lessons. `price` and `space` must remain numbers. Every lesson starts with 5 spaces, so total initial availability is 50. Initial enrolment is 0 because there are no orders; enrolment will be calculated from purchased quantities in order records.

The image fields are planned API paths. Image files and static serving will be added in Phase 4; these paths do not serve images yet. The sample prices are fictional amounts, planned for display in GBP.

After import, verify the document counts, field types, initial spaces and teacher references. Do not insert the files twice: their fixed IDs will cause duplicate-key errors. Do not reset availability or delete bookings to repeat an import once real order testing begins.

These files are initial fixtures, not the final database exports required for submission. Export the actual Atlas collections during Phase 12.
