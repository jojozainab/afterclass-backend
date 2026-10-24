# Initial Atlas Data

These files record the initial data for my `afterclass` database.

| File | Atlas collection | Initial records |
| --- | --- | --- |
| `teachers.json` | `teacher` | Five teachers |
| `lessons.json` | `lesson` | Ten lessons with five spaces each |

The order collection was initially empty. Initial enrolment was therefore zero, and total initial availability was 50 spaces.

The files use MongoDB Extended JSON. `$oid` represents a MongoDB ObjectId; each lesson's teacherId matches one teacher's `_id`. Each teacher is associated with two lessons. Price and space values are numeric, with fictional prices displayed in GBP.

The image paths correspond to the JPEG title cards served by the Express API from `public/images`.

I inserted these records into Atlas and verified the record counts, availability and ObjectId relationships. The fixed IDs make repeated insertion produce duplicate-key errors. Current Atlas availability and orders reflect later booking tests, while these fixtures preserve the original state.

These files are initial fixtures, not exports of the current database. The current collection exports are a separate submission item whose preparation is tracked in the submission checklist.
