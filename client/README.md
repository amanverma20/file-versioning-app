# Client - File Versioning App

Install:

```
cd client
npm install
```

Run dev server:

```
npm run dev
```

By default the client expects the server at `http://localhost:5000`.

If you want to enable the enhanced UI (Tailwind, Framer Motion, toasts) install the new dependencies:

```
cd client
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion react-hot-toast
npx tailwindcss init -p
```

Note: I already added `tailwind.config.js` and `postcss.config.cjs` into the project. After installing, run `npm run dev`.
