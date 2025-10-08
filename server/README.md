# Server - File Versioning App

Requirements:
- Node 18+ (or compatible)
- MongoDB running locally or use a connection string

Install:

```
cd server
npm install
```

Create a `.env` from `.env.example` and set `MONGO_URI` and `JWT_SECRET`.

Run:

```
npm run dev
```

APIs:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- CRUD /api/repos
- File upload: POST /api/files/:repoId/upload (form-data 'file')
- List files: GET /api/files/:repoId
- File versions: GET /api/files/:repoId/files/:fileId/versions
- Download: GET /api/files/download/:versionId
