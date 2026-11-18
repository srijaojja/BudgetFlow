# BudgetFlow — Complete frontend (transaction title fix)

## Start
1. Start your existing Spring Boot backend on port 8080.
2. In this folder run `npm install` then `npm run dev`.
3. Open http://localhost:5173 and sign in.

## Transaction fix
The transaction form still says Description, but POST /api/transactions now sends `title`, matching the Spring Boot validation error `title: must not be blank`.

If the backend reports another validation error, check its transaction request DTO and adjust the POST body in `src/App.jsx`. This frontend cannot verify your private backend DTOs.

## Files
`src/App.jsx`, `src/api.js`, `src/categories.js`, `src/style.css`, `src/main.jsx`, `index.html`, `package.json`, `vite.config.js`.
