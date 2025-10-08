# file-versioning-app API Documentation

Base URL (local): `http://localhost:5000/api`

Authentication: All protected endpoints require a Bearer JWT token in the `Authorization` header.
Example: `Authorization: Bearer <token>`

Common Response Shape
- On success: JSON (resource or message)
- On error: `{ message: string }` with appropriate HTTP status code (400, 401, 403, 404, 500)

---

## Auth

### POST /api/auth/register
Register a new user.

Request JSON body:
- name: string (required)
- email: string (required)
- password: string (required)

Response (200):
{
  "token": "<jwt>",
  "user": { "id": "<userId>", "name": "Alice", "email": "alice@example.com" }
}

Errors:
- 400 if missing fields or user already exists.

Example cURL:

```bash
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

---

### POST /api/auth/login
Login existing user.

Request JSON body:
- email: string (required)
- password: string (required)

Response (200): same shape as register.

Errors:
- 400 Invalid credentials or missing fields.

Example cURL:

```bash
curl -X POST http://localhost:5000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"alice@example.com","password":"secret123"}'
```

---

### POST /api/auth/logout
Client-side token removal is sufficient; this endpoint returns a message for completeness.

Response: `{ message: 'Logged out' }`

---

## Repositories

All repository endpoints require `Authorization: Bearer <token>` header.

### GET /api/repos
Get repositories the user owns or collaborates on.

Response: Array of Repository objects.

Repository object sample:
```json
{
  "_id": "...",
  "name": "My Repo",
  "description": "Optional",
  "owner": { "_id": "...", "name": "Owner name", "email": "owner@example.com" },
  "collaborators": [ { "_id": "...", "name": "Colab", "email": "c@example.com" } ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

Example cURL:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/repos
```

---

### POST /api/repos
Create a new repository (authenticated).

Request JSON body:
- name: string (required)
- description: string (optional)

Response: created Repository object.

Example:
```bash
curl -X POST http://localhost:5000/api/repos \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"name":"Project X","description":"Docs and assets"}'
```

---

### GET /api/repos/:id
Get single repository details (owner + collaborators populated).

Responses:
- 200 Repository object
- 404 if not found

---

### PUT /api/repos/:id
Update repository (only owner allowed).

Request JSON body: any mutable fields (e.g., `name`, `description`).

Response: updated repository object.

Errors:
- 403 if not owner
- 404 if not found

---

### DELETE /api/repos/:id
Delete repository (only owner). This performs cascade cleanup of files and versions stored on disk and removes DB documents.

Response: `{ message: 'Repository deleted' }`

Errors:
- 403 if not owner
- 404 if not found

---

### POST /api/repos/:id/collaborators
Add collaborator to repository (owner only).

Request JSON body:
- email: string (required) — user's email to add

Response: updated repository object.

Errors:
- 403 if not owner
- 404 if user not found
- 400 if already a collaborator

---

## Files

All file endpoints require `Authorization: Bearer <token>` header and repository access (owner or collaborator).

### POST /api/files/:repoId/upload
Upload a file to repository. If a file with the same original name exists, a new version is created.

Content type: multipart/form-data
- file: the file content (form field name `file`)

Response: `{ file, version }` where `file` is the File document and `version` is the newly created FileVersion document.

Errors:
- 404 if repository not found
- 403 if user not allowed

Example using curl:
```bash
curl -X POST http://localhost:5000/api/files/<repoId>/upload \
 -H "Authorization: Bearer $TOKEN" \
 -F "file=@/path/to/file.pdf"
```

---

### GET /api/files/:repoId
List files in repository (with versions populated, sorted by versionNumber desc).

Response: array of File objects. File sample:
```json
{
  "_id": "...",
  "repository": "...",
  "filename": "uuid-file-on-disk.ext",
  "originalName": "file.pdf",
  "versions": [ /* array of FileVersion docs sorted */ ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET /api/files/:repoId/files/:fileId/versions
Get versions for a specific file (sorted desc).

Response: array of FileVersion objects:
```json
{
  "_id": "...",
  "file": "<fileId>",
  "versionNumber": 2,
  "filename": "uuid.ext",
  "originalName": "file.pdf",
  "uploader": { "_id": "..", "name": "..", "email": ".." },
  "size": 12345,
  "mimeType": "application/pdf",
  "createdAt": "..."
}
```

---

### GET /api/files/download/:versionId
Download a specific file version. Response is a file download (Content-Disposition attachment).

Errors:
- 404 if version not found
- 403 if user has no access

Example:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/files/download/<versionId> --output myfile.pdf
```

---

## Notes & Implementation Details
- Authentication uses JWT with secret supplied via `JWT_SECRET` env var. Tokens are signed with `expiresIn` from `TOKEN_EXPIRES_IN` env or default `7d`.
- File storage for now is local disk at `server/uploads/` — filenames are UUIDs created by the upload service. When deleting repos, the server attempts to unlink files from `server/uploads`.
- In production you should use durable object storage (S3, Azure Blob) instead of local disk and switch to presigned URLs for downloads.

## Error Codes
- 400 Bad request — missing fields or validation errors
- 401 Unauthorized — missing/invalid token (auth middleware)
- 403 Forbidden — insufficient permissions
- 404 Not found — resource missing
- 500 Server error — unexpected

---

If you want, I can:
- Export a ready-to-import Postman collection file (I created `docs/postman_collection.json`).
- Generate an OpenAPI (Swagger) spec (YAML/JSON) for use with tools like Swagger UI.
- Add example responses and sample data for each endpoint.

Which would you like next?