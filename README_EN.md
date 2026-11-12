# JL Book Order Application

Just Lee Book Order System — complete course project implementation (**Oracle 12c edition**).

- **Database**: Oracle 12c (school server `199.212.26.208:1521/ORACLE1PDB1`, schema `COMP214_F26_ers_8`) — tables + stored procedures + functions + triggers live in `sql_oracle/`
- **Backend service**: Node.js + Express (`node-oracledb` thin mode pool — no Instant Client needed; all business logic executed via stored procedures)
- **Frontend**: React (Vite) + Tailwind CSS + React Router — calls the REST API, which in turn calls the database stored procedures
- **One-command startup**: root-level `npm run dev` uses `concurrently` to launch both frontend and backend at once
- **Status**: schema installed on the school server, backend verified end-to-end on 2026-11-11 (details in `oracle_sql_developer.md`); the project is Oracle-only — all MySQL code has been removed
- SQL Developer setup guide (schema creation + verification + demo calls + backend config): see **`oracle_sql_developer.md`**

## Quick Start

```bash
# 0) Prerequisites: Oracle 12c schema ready (run sql_oracle scripts 02-04 in SQL
#    Developer if needed — see oracle_sql_developer.md) + Node.js 18+

# 1) Install all dependencies in one go (root concurrently + backend + frontend)
npm run install-all

# 2) Configure the DB connection: edit backend/.env (see backend/.env.example)
#    DB_USER=COMP214_F26_ers_8
#    DB_PASSWORD=your_password
#    DB_CONNECT_STRING=199.212.26.208:1521/ORACLE1PDB1

# 3) Start both servers with one command
npm run dev
```

Output of `npm run dev` (`[server]` prefix = Express, `[client]` prefix = Vite):

```
[db] Oracle connection pool created -> 199.212.26.208:1521/ORACLE1PDB1
[server] JL Book Order API listening on http://localhost:3000
[client]   ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

> If port 5173 is held by another process, Vite prints
> `Port 5173 is in use, trying another one...` and serves on **5174** —
> just open the URL it prints.

## All Commands

| Command | Location | Purpose |
|---|---|---|
| `npm run install-all` | root | Install root + backend + frontend dependencies |
| `npm run dev` | root | **Start backend (3000) + frontend (5173) together** (concurrently, with colored prefixes) |
| `npm start` | root | Backend in production mode + built frontend preview (`vite preview`) |
| `npm run server` / `npm run client` | root | Start backend only / frontend only |
| `npm run dev` | backend/ | `node --watch server.js` (auto-restarts on code changes) |
| `npm run dev` | frontend/ | Vite dev server (HMR hot reload) |

You can also do it manually step by step: `cd backend` → `copy .env.example .env` and fill in credentials → `npm install && npm start`; then `cd frontend` → `npm install && npm run dev`.

> Database objects (tables/procedures/functions/triggers/sequences) are created
> in SQL Developer, not from Node — there is no `setup-db` command for Oracle.
> See `oracle_sql_developer.md` for the exact steps.

## Project Structure

```
jl-book-order-app/
├── package.json                  ← root commands (concurrently one-command startup)
├── sql_oracle/                   ← Oracle 12c scripts — run in SQL Developer (Run Script, F5)
│   ├── 01_create_tables.sql      7 tables + sequences JL_CUSTOMER_SEQ / JL_ORDER_SEQ
│   │                             (SKIP on a schema that already has the JustLee tables)
│   ├── 02_stored_procedures.sql  Stored procedures (sp_Book_register with 8 params, sp_register_author with 3,
│   │                             sp_assign_author, sp_book_update, sp_register_customer with OUT param,
│   │                             sp_update_customer)
│   ├── 03_functions.sql          Functions (fn_book_profit, fn_books_in_category, fn_customer_name)
│   ├── 04_triggers.sql           Triggers (cost ≤ retail validation, book update audit, ship-date validation)
│   └── 05_seed_data.sql          Classic JustLee sample data (SKIP if data already exists)
├── backend/                      Node.js + Express API (port 3000)
│   ├── server.js                 Entry point (error-mapping middleware: 409 duplicate / 400 business rule / 404 not found)
│   ├── db.js                     node-oracledb thin-mode pool (OUT params returned via bind variables)
│   ├── routes/                   books.js / authors.js / customers.js (all call stored procedures)
│   └── .env / .env.example       Oracle connection config (DB_USER / DB_PASSWORD / DB_CONNECT_STRING)
└── frontend/                     React (Vite) + Tailwind CSS frontend (port 5173)
    ├── public/covers/            Book covers (named by ISBN; missing images fall back to a gradient placeholder)
    ├── public/artwork/           JustLee Tech Series showcase images
    └── src/pages/                Dashboard main menu + 7 pages for Books / Authors / Customers
```

## REST API Reference (every operation ultimately executes a stored procedure)

| Method & Path | Stored procedure / SQL invoked | Description |
|---|---|---|
| `GET /api/health` | — | Health check |
| `GET /api/books` | SELECT + `fn_book_profit` | Book list (includes computed profit column) |
| `GET /api/books/publishers` | SELECT | Publisher dropdown data |
| `GET /api/books/:isbn/authors` | SELECT (JOIN on `JL_BOOKAUTHOR`) | Authors linked to a book |
| `POST /api/books` | `sp_Book_register` 8 params | Register a book (duplicate ISBN → 409) |
| `PUT /api/books/:isbn` | `sp_book_update` | Edit Category/Cost/Retail only (cost > retail rejected by trigger → 400) |
| `GET /api/authors` | SELECT + count | Author list (includes book count) |
| `POST /api/authors` | `sp_register_author` | Register an author (duplicate ID → 409) |
| `POST /api/authors/assign` | `sp_assign_author` | Book↔author association (duplicate / FK failure → 409/400) |
| `GET /api/customers` | SELECT (`JL_CUSTOMERS`) | Customer list |
| `GET /api/customers/:id` | SELECT | Single customer (not found → 404) |
| `POST /api/customers` | `sp_register_customer` | Register a customer; OUT parameter returns the sequence-generated customer number (starts 1021 on the course schema) |
| `PUT /api/customers/:id` | `sp_update_customer` | Update contact info (NVL preserves untouched fields; not found → 404) |

**Error response convention**: business rule violation (e.g. cost > retail) → `400`; duplicate primary key → `409`; resource not found → `404`; other server errors → `500`. Responses are always `{ "error": "friendly message" }`.

## Verified Status (2026-11-11)

- Database: all 6 procedures, 3 functions and 3 triggers compiled **VALID** on
  the school server; sequences `JL_CUSTOMER_SEQ` (starts 1021) and
  `JL_ORDER_SEQ` created; course data untouched
- API read: all 7 GET endpoints return live Oracle data through the frontend
  proxy
- API write: `POST /api/books` (via `sp_Book_register`) and
  `PUT /api/customers/:id` (via `sp_update_customer`) verified
- Error paths: unknown ISBN → `ORA-20001` handled; cost > retail → trigger
  `ORA-20101` handled; audit trigger writes to `JL_BOOKS_AUDIT`

## Task Mapping (grading points)

| Requirement | Where it is implemented |
|---|---|
| Task 1-1 `sp_Book_register` (8-param INSERT + COMMIT) | `sql_oracle/02_stored_procedures.sql` |
| Task 1-2 Book registration form (PubID dropdown, Category dropdown, Register/Cancel buttons) | Frontend `BookRegister.jsx` → `sp_Book_register` |
| Task 1-3 Book list grid + UPDATE limited to Category/Cost/Retail | Frontend `BookList.jsx` → `sp_book_update` |
| Task 2-1 `sp_register_author` (3 params) + author registration page | `sql_oracle/02` + `AuthorRegister.jsx` → `sp_register_author` |
| Task 2-2 ISBN + Author ID dropdowns to link books and authors (COMMIT) | `AssignAuthor.jsx` → `sp_assign_author` (writes `JL_BOOKAUTHOR`) |
| Task 3-1 Customer registration form (sequence generates the customer number, returned via OUT param) | `CustomerRegister.jsx` → `sp_register_customer` (writes `JL_CUSTOMERS`) |
| Task 3-2 Customer update (Address/City/State/Region/Email — update any subset, NVL keeps untouched fields) | `CustomerUpdate.jsx` → `sp_update_customer` |
| Extra credit: functions, triggers | `sql_oracle/03_functions.sql`, `sql_oracle/04_triggers.sql` |

## Course-schema notes

- The key column of `JL_CUSTOMERS` is `"CUSTOMER#"` (quoted identifier) and the
  book↔author bridge table is `JL_BOOKAUTHOR`; the backend aliases
  `"CUSTOMER#"` back to `CUSTOMERNUMBER` so the React pages work unchanged.
- Column widths are narrow: `ISBN VARCHAR2(10)`, `ZIP VARCHAR2(5)`,
  `AUTHORID VARCHAR2(4)` — test data must fit.
- `sp_book_update` raises `ORA-20001` and `sp_update_customer` raises
  `ORA-20002` for unknown keys; the cost > retail trigger raises `ORA-20101`.

## Presentation Tips

1. In SQL Developer, live-run `EXEC sp_Book_register('1234567890', ...)` to insert a book and verify with SELECT — proving the stored procedures work standalone.
2. Then repeat the same operation in the GUI — proving the full chain GUI → Express → stored procedure.
3. Demo the BookList grid: click a row to highlight it → change Cost/Retail only → save → query in SQL Developer to confirm the UPDATE (you can also show the `JL_BOOKS_AUDIT` audit trigger effect).
4. Demo the Assign Author dropdowns and the auto-generated customer number returned after registration (OUT parameter).
5. Suggested slide outline: architecture diagram (React → Express → Oracle 12c) → one slide per task (form screenshot + corresponding procedure code) → team contributions → live demo section.
