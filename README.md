# File Versioning App

A production-minded MERN sample application that demonstrates a File Versioning & Access Control system. It includes:

- An Express + MongoDB backend implementing authentication, repositories, file upload with versioning, and per-version downloads.
- A Vite + React frontend using Framer Motion and react-hot-toast for a modern UI.

## Demo Vedio : https://drive.google.com/file/d/152LFBOCrWK7Es9AFOLoRWwq2-KddHrJn/view?usp=sharing

This README contains:

- Project setup (local)
- Run instructions (dev & prod)
- Implemented features
- Architecture & data model
- API reference (key endpoints)
- Environment variables
- Deployment notes (Render + Vercel + Docker)
- S3 migration guidance (optional)
- Troubleshooting & tips

---

## Project layout

- `server/` — Express server, Mongoose models, routes and upload handling
- `client/` — React app (Vite), pages, API wrappers, and context

## Quick local setup

### 1) Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### 2) Install dependencies

```cmd
cd d:\mern_assignment\file-versioning-app\server
npm install
cd ..\client
npm install
```

### 3) Create server env file (`server/.env`)

```
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<a-strong-jwt-secret>
PORT=5000
# Optional if using S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET=
```

### 4) Run the app locally (two terminals)

Backend:

```cmd
cd d:\mern_assignment\file-versioning-app\server
npm run dev
```

Frontend:

```cmd
cd d:\mern_assignment\file-versioning-app\client
npm run dev
```

> The frontend defaults to `http://localhost:5000/api` for the API. Update `client/src/api/http.js` if necessary.

## Scripts

- Backend
	- `npm run dev` — start server with nodemon
	- `npm start` — start server (production)
- Frontend
	- `npm run dev` — start Vite dev server
	- `npm run build` — build for production
	- `npm run preview` — preview production build

## Implemented features

- Authentication: register and login (JWT + bcrypt)
- Repository management: create/list/view repositories; owner/collaborator model
- File versioning: upload same `originalName` multiple times to create version history
- Download by version: list versions and download specific versions
- Upload progress with UI feedback
- UI polish: Framer Motion animations and toast notifications

## Architecture & data model

**Backend**: Express + Mongoose

- Models: User, Repository, File, FileVersion
- Uploads: saved to `server/uploads` by default (disk). Optionally can use S3 for production durability.
- Auth: JWT in `Authorization` header

**Frontend**: React + Vite

- `AuthContext` manages auth/token in localStorage
- API wrappers in `client/src/api/*`

## API reference (selected)

**Auth**

- `POST /api/auth/register` — body: { name, email, password }
- `POST /api/auth/login` — body: { email, password } → returns { user, token }

**Repositories**

- `GET /api/repos` — list repositories for the authenticated user
- `POST /api/repos` — create a repository
- `GET /api/repos/:id` — get repository details
- `PUT /api/repos/:id` — update repo (owner only)
- `DELETE /api/repos/:id` — delete repo (owner only; cascades files)
- `POST /api/repos/:id/collaborators` — add collaborator by email (owner only)

**Files**

- `GET /api/files/:repoId` — list files in repository
- `POST /api/files/:repoId/upload` — upload a file (multipart/form-data: file)
- `GET /api/files/:repoId/files/:fileId/versions` — list versions
- `GET /api/files/download/:versionId` — download (or presigned URL)

## Environment variables

**Server (`server/.env`)**

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `PORT` — server port (default 5000)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` — if integrating with S3

**Client (Vite)**

- `VITE_API_BASE_URL` — base URL for the backend API (e.g., `https://api.example.com/api`). Locally the client uses `http://localhost:5000/api` by default.

## Deployment notes

### Option A — Fast (Render backend + Vercel frontend)

1. Push this repo to GitHub.
2. Create a MongoDB Atlas cluster and copy the connection string.
3. (Optional) Create an S3 bucket and IAM user for durable storage.
4. Deploy backend on Render:
	 - Create a new Web Service, point to the `server/` folder (or repo root) and set the start command to `npm start`.
	 - Add environment variables in the Render dashboard (`MONGO_URI`, `JWT_SECRET`, `AWS_*` if used).
5. Deploy frontend on Vercel:
	 - Import the `client/` folder and set `VITE_API_BASE_URL` to your backend URL (include `/api`).

### Option B — Container (Docker)

- Build a Docker image for the server and run it on a VPS or cloud service. Mount a host path (volume) to persist `server/uploads` if using local disk.

Example Dockerfile (server):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
```

Run with a mounted uploads directory:

```bash
docker build -t file-versioning-app-server ./server
docker run -d -p 5000:5000 -v /opt/file-versioning-app/uploads:/app/uploads \
	-e MONGO_URI="..." -e JWT_SECRET="..." file-versioning-app-server
```

## S3 migration guidance (optional)

If you want durable storage, switch uploads to S3. High-level steps:

1. Create S3 bucket and IAM user with Put/Get/Delete permissions.
2. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
3. Use `multer.memoryStorage()` and upload the buffer to S3, saving the S3 key in `FileVersion.filename`.
4. Use presigned URLs for downloads.
5. (Optional) Run a migration script to upload existing `server/uploads` files to S3 and update DB records.

## Troubleshooting

- If the client cannot reach the API, ensure `VITE_API_BASE_URL` matches and that CORS is allowed on the backend.
- If deleting a repo returns 500, check server logs — the delete handler attempts to remove file records and disk objects.

## Next steps I can help with

- Add S3 helper and migration script
- Create Dockerfile and deployment guide for a VPS
- Create GitHub Actions workflow for CI/CD
