# Oracle 12c + SQL Developer — Configure & Run Guide

Step-by-step instructions for the JL Book Order application on the **school
Oracle 12c server** (`COMP214_F26_ers_8` @ `199.212.26.208:1521/ORACLE1PDB1`,
connection `adsql` in SQL Developer).

> **STATUS: fully set up and verified (2026-11-11).** The tables and JustLee
> course data already existed; the procedures, functions, triggers and
> sequences were created and smoke-tested successfully. The backend is the
> **only** database driver in the project (`node-oracledb`) — all MySQL code
> was removed. You only need Part 5 to run the app. Parts 2–4 document how to
> re-create the objects (useful for a fresh schema or for the live demo).

## Your schema (verified)

| Object | Status |
|---|---|
| `JL_BOOKS` (14 rows), `JL_AUTHOR` (14), `JL_BOOKAUTHOR` (20), `JL_CUSTOMERS` (20+), `JL_PUBLISHER` (5), `JL_ORDERS` (21), `JL_ORDERITEMS` (32) | existed — untouched |
| `JL_CUSTOMER_SEQ` | created, starts at 1021 (next free customer number) |
| `JL_ORDER_SEQ` | created, starts at 1021 |
| 6 procedures: `sp_Book_register`, `sp_register_author`, `sp_assign_author`, `sp_book_update`, `sp_register_customer`, `sp_update_customer` | compiled VALID |
| 3 functions: `fn_book_profit`, `fn_books_in_category`, `fn_customer_name` | compiled VALID |
| 3 triggers: `trg_books_cost_check`, `trg_books_audit`, `trg_orders_shipdate` + `JL_BOOKS_AUDIT` table | compiled VALID |

**Naming note:** the course schema follows the textbook — the customer key
column is `"CUSTOMER#"` (quoted identifier) and the bridge table is
`JL_BOOKAUTHOR`. The project scripts in `sql_oracle/` were adapted to match
(`JL_CUSTOMERS` / `JL_BOOKAUTHOR` / `"CUSTOMER#"`), and the backend queries
alias `"CUSTOMER#"` back to `CUSTOMERNUMBER` so the React pages work unchanged.

## Part 1 — SQL Developer connection

1. Open SQL Developer → connection **`adsql`**
   (Basic, host `199.212.26.208`, port `1521`, **Service name** `ORACLE1PDB1`,
   user `COMP214_F26_ers_8`).
2. Click **Test** → `Status: Success` → **Connect**.

## Part 2 — Creating the objects (already done; for reference / fresh schemas)

Scripts live in `sql_oracle/` and run in this order, always with
**Run Script (F5)** — *not* "Run Statement" (multi-line PL/SQL blocks end
with `/`):

| Order | Script | Notes |
|---|---|---|
| 1 | `01_create_tables.sql` | **Skip on the course schema** — tables already exist with data; running it would drop them |
| 2 | `02_stored_procedures.sql` | `CREATE OR REPLACE` — safe to re-run |
| 3 | `03_functions.sql` | `CREATE OR REPLACE` — safe to re-run |
| 4 | `04_triggers.sql` | drops & recreates `JL_BOOKS_AUDIT` / `JL_AUDIT_SEQ` — safe to re-run (audit rows are lost) |
| 5 | `05_seed_data.sql` | **Skip on the course schema** — data already exists |

If the two sequences are missing, create them starting **above** the current
max ids:

```sql
SELECT NVL(MAX("CUSTOMER#"), 1000) + 1 FROM JL_CUSTOMERS;  -- use as START WITH
SELECT NVL(MAX(ORDER#), 5000) + 1       FROM JL_ORDERS;

CREATE SEQUENCE JL_CUSTOMER_SEQ START WITH <value> INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE JL_ORDER_SEQ    START WITH <value> INCREMENT BY 1 NOCACHE;
```

## Part 3 — Verify the installation

```sql
SELECT object_name, object_type, status
  FROM user_objects
 WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'TRIGGER')
   AND (object_name LIKE 'SP\_%' ESCAPE '\'
        OR object_name LIKE 'FN\_%' ESCAPE '\'
        OR object_name LIKE 'TRG\_%')
 ORDER BY object_type, object_name;
-- 12 rows, all VALID (6 procedures + 3 functions + 3 triggers)

SELECT sequence_name FROM user_sequences
 WHERE sequence_name IN ('JL_CUSTOMER_SEQ', 'JL_ORDER_SEQ', 'JL_AUDIT_SEQ');

SELECT object_name, object_type FROM user_objects WHERE status = 'INVALID';
-- should return no rows
```

## Part 4 — Demo test calls (SQL Developer)

Enable DBMS Output first: **View → DBMS Output → + → adsql**. Note that ISBN
is `VARCHAR2(10)` on this schema — test ISBNs must be ≤ 10 characters.

```sql
-- Task 1-1: register a book (8 parameters)
EXEC sp_Book_register('1234567890', 'Test Book Title',
                      TO_DATE('2024-05-01','YYYY-MM-DD'), 1, 19.99, 34.50, 5, 'Computing');
SELECT * FROM jl_books WHERE isbn = '1234567890';

-- Task 1-3: update ONLY Category / Cost / Retail
EXEC sp_book_update('1234567890', 'Science', 21.50, 36.00);

-- Task 2-1 + 2-2: register an author and assign a book
EXEC sp_register_author('W106', 'Doe', 'Jane');
EXEC sp_assign_author('1234567890', 'W106');
SELECT * FROM jl_bookauthor WHERE isbn = '1234567890';

-- Task 3-1: register a customer (number comes back via OUT parameter,
-- starting at 1021 on this schema)
DECLARE
  v_num NUMBER;
BEGIN
  sp_register_customer('Alice','Brown','100 Main St','Orlando','FL',
                       '32801','N','alice@mail.com', NULL, v_num);
  DBMS_OUTPUT.PUT_LINE('New customer number: ' || v_num);
END;
/

-- Task 3-2: update customer info (NULL keeps the old value)
EXEC sp_update_customer(1001, NULL, NULL, NULL, NULL, 'newmail@sat.net');

-- Extra credit: functions
SELECT fn_book_profit('1059831198')     AS profit     FROM dual;
SELECT fn_books_in_category('COMPUTER') AS book_count FROM dual;
SELECT fn_customer_name(1011)           AS cust_name  FROM dual;

-- Extra credit: audit trigger
UPDATE jl_books SET cost = cost + 1 WHERE isbn = '1059831198';
SELECT * FROM jl_books_audit ORDER BY audit_id DESC;
```

Expected errors (prove validation works):
- unknown ISBN → `ORA-20001: Book not found: ...`
- unknown customer → `ORA-20002: Customer not found: ...`
- `COST > RETAIL` → `ORA-20101: Cost (...) cannot be higher than Retail (...)`

## Part 5 — Run the app (Oracle is already wired in)

`backend/db.js` is the only database driver in the project (`node-oracledb`
thin mode), and `backend/.env` is already configured:

```ini
DB_USER=COMP214_F26_ers_8
DB_PASSWORD=********
DB_CONNECT_STRING=199.212.26.208:1521/ORACLE1PDB1
PORT=3000
```

**One-command startup** (backend 3000 + frontend 5173 together, from the
project root):

```cmd
npm run install-all   REM first time only
npm run dev           REM [server] = Express on 3000, [client] = Vite on 5173
```

Expected log:

```
[server] [db] Oracle connection pool created -> 199.212.26.208:1521/ORACLE1PDB1
[server] [server] JL Book Order API listening on http://localhost:3000
[client]   ➜  Local:   http://localhost:5173/
```

> If port 5173 is occupied (a zombie system entry can hold it), Vite prints
> "Port 5173 is in use, trying another one..." and serves on **5174** — use
> that URL instead. Only one instance at a time; a second `npm run dev`
> fails with `EADDRINUSE` on port 3000.

You can also start them separately: `cd backend && npm start`, then
`cd frontend && npm run dev`.

Quick smoke test (verified working):

```cmd
curl http://localhost:3000/api/health
curl http://localhost:3000/api/books
curl http://localhost:3000/api/customers
curl -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d "{\"isbn\":\"9876543210\",\"title\":\"API TEST\",\"pubdate\":\"2024-06-01\",\"pubid\":1,\"cost\":10,\"retail\":20,\"discount\":0,\"category\":\"COMPUTER\"}"
```

### Verified end-to-end (2026-11-11)

- Read: `GET /api/health`, `/api/books`, `/api/books/publishers`,
  `/api/books/:isbn/authors`, `/api/authors`, `/api/customers`,
  `/api/customers/:id` — all return live Oracle data through the frontend
  proxy (http://localhost:5174/api/customers → real course rows)
- Write: `POST /api/books` → `sp_Book_register` committed a row;
  `PUT /api/customers/:id` → `sp_update_customer` updated a row
- Procedures/functions/triggers: 6 + 3 + 3 all compiled VALID, smoke-tested
  via direct `callProcedure` calls (register customer 1022, book update,
  expected ORA-20001 error path, audit trigger row)

## Part 6 — Troubleshooting

| Problem | Fix |
|---|---|
| `EADDRINUSE` / port 3000 busy | another `npm start` / `npm run dev` is still running — close it first |
| Frontend on 5174 instead of 5173 | port 5173 is held by a zombie system entry — harmless, just open the URL Vite prints |
| `ORA-01017` | wrong/expired class account password — check in SQL Developer |
| `ORA-12541` / network adapter error | school server down or you are off the college network |
| `ORA-12899: value too large` | the course columns are narrow (`ZIP VARCHAR2(5)`, `ISBN VARCHAR2(10)`, `AUTHORID VARCHAR2(4)`) — use short values |
| Frontend shows network errors | backend not running — start `npm run dev` in the project root first |
| Book/Customer not found | intentional `ORA-20001` / `ORA-20002` from the procedures |

## Part 7 — Related docs

Project overview, commands and task mapping: see `README_EN.md`.
