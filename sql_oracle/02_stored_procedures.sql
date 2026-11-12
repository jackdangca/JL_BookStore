-- ============================================================
-- JL (Just Lee) Book Order Application
-- Script 02: Stored procedures
-- All procedures compile cleanly on Oracle 12c and include COMMIT.
-- Test calls at the bottom of the file.
-- ============================================================

-- ------------------------------------------------------------
-- Task 1-1 : sp_Book_register
-- Accepts 8 parameters and inserts a new row into JL_BOOKS.
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_Book_register (
    par_isbn     IN JL_BOOKS.ISBN%TYPE,
    par_title    IN JL_BOOKS.TITLE%TYPE,
    par_pubdate  IN JL_BOOKS.PUBDATE%TYPE,
    par_pubid    IN JL_BOOKS.PUBID%TYPE,
    par_cost     IN JL_BOOKS.COST%TYPE,
    par_retail   IN JL_BOOKS.RETAIL%TYPE,
    par_discount IN JL_BOOKS.DISCOUNT%TYPE,
    par_category IN JL_BOOKS.CATEGORY%TYPE
) IS
BEGIN
    INSERT INTO JL_BOOKS (ISBN, TITLE, PUBDATE, PUBID, COST, RETAIL, DISCOUNT, CATEGORY)
    VALUES (par_isbn, par_title, par_pubdate, par_pubid, par_cost, par_retail,
            NVL(par_discount, 0), par_category);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;   -- re-raise so the front end receives a real error
END sp_Book_register;
/

-- ------------------------------------------------------------
-- Task 2-1 : sp_register_author
-- Accepts 3 parameters (Author ID, Last name, First name)
-- and inserts a new row into JL_AUTHOR.
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_register_author (
    par_authorid IN JL_AUTHOR.AUTHORID%TYPE,
    par_lname    IN JL_AUTHOR.LNAME%TYPE,
    par_fname    IN JL_AUTHOR.FNAME%TYPE
) IS
BEGIN
    INSERT INTO JL_AUTHOR (AUTHORID, LNAME, FNAME)
    VALUES (par_authorid, par_lname, par_fname);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_register_author;
/

-- ------------------------------------------------------------
-- Task 2-2 : sp_assign_author
-- Registers an ISBN to an Author ID (inserts into JL_BOOKAUTHOR).
-- COMMIT is executed after the INSERT.
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_assign_author (
    par_isbn     IN JL_BOOKAUTHOR.ISBN%TYPE,
    par_authorid IN JL_BOOKAUTHOR.AUTHORID%TYPE
) IS
BEGIN
    INSERT INTO JL_BOOKAUTHOR (ISBN, AUTHORID)
    VALUES (par_isbn, par_authorid);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_assign_author;
/

-- ------------------------------------------------------------
-- Task 1-3 : sp_book_update
-- Updates ONLY Category / Cost / Retail of a selected book.
-- Called by the Book List & Update grid page.
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_book_update (
    par_isbn     IN JL_BOOKS.ISBN%TYPE,
    par_category IN JL_BOOKS.CATEGORY%TYPE,
    par_cost     IN JL_BOOKS.COST%TYPE,
    par_retail   IN JL_BOOKS.RETAIL%TYPE
) IS
BEGIN
    UPDATE JL_BOOKS
       SET CATEGORY = NVL(par_category, CATEGORY),
           COST     = NVL(par_cost, COST),
           RETAIL   = NVL(par_retail, RETAIL)
     WHERE ISBN = par_isbn;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Book not found: ' || par_isbn);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_book_update;
/

-- ------------------------------------------------------------
-- Task 3-1 : sp_register_customer
-- Inserts a new customer. The customer number comes from a sequence
-- and is returned to the caller (OUT parameter) so the GUI can show it.
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_register_customer (
    par_fname    IN JL_CUSTOMERS.FIRSTNAME%TYPE,
    par_lname    IN JL_CUSTOMERS.LASTNAME%TYPE,
    par_address  IN JL_CUSTOMERS.ADDRESS%TYPE,
    par_city     IN JL_CUSTOMERS.CITY%TYPE,
    par_state    IN JL_CUSTOMERS.STATE%TYPE,
    par_zip      IN JL_CUSTOMERS.ZIP%TYPE,
    par_region   IN JL_CUSTOMERS.REGION%TYPE,
    par_email    IN JL_CUSTOMERS.EMAIL%TYPE,
    par_referred IN JL_CUSTOMERS.REFERRED%TYPE,
    par_custnum  OUT JL_CUSTOMERS."CUSTOMER#"%TYPE
) IS
BEGIN
    par_custnum := JL_CUSTOMER_SEQ.NEXTVAL;

    INSERT INTO JL_CUSTOMERS ("CUSTOMER#", FIRSTNAME, LASTNAME, ADDRESS, CITY,
                              STATE, ZIP, REGION, EMAIL, REFERRED)
    VALUES (par_custnum, par_fname, par_lname, par_address, par_city,
            par_state, par_zip, par_region, par_email, par_referred);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_register_customer;
/

-- ------------------------------------------------------------
-- Task 3-2 : sp_update_customer
-- Updates Address / City / State / Region / Email for a customer.
-- Only the fields the user changed need real new values; others may
-- be passed as NULL and will keep their old value (NVL logic).
-- ------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_update_customer (
    par_custnum  IN JL_CUSTOMERS."CUSTOMER#"%TYPE,
    par_address  IN JL_CUSTOMERS.ADDRESS%TYPE,
    par_city     IN JL_CUSTOMERS.CITY%TYPE,
    par_state    IN JL_CUSTOMERS.STATE%TYPE,
    par_region   IN JL_CUSTOMERS.REGION%TYPE,
    par_email    IN JL_CUSTOMERS.EMAIL%TYPE
) IS
BEGIN
    UPDATE JL_CUSTOMERS
       SET ADDRESS = NVL(par_address, ADDRESS),
           CITY    = NVL(par_city,    CITY),
           STATE   = NVL(par_state,   STATE),
           REGION  = NVL(par_region,  REGION),
           EMAIL   = NVL(par_email,   EMAIL)
     WHERE "CUSTOMER#" = par_custnum;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Customer not found: ' || par_custnum);
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END sp_update_customer;
/

-- ============================================================
-- TEST SECTION (run these one at a time in SQL Developer)
-- ============================================================

-- Test Task 1-1: register a book (ISBN is VARCHAR2(10) on the course schema)
-- EXEC sp_Book_register('9780134589', 'Test Book Title', TO_DATE('2024-05-01','YYYY-MM-DD'), 1, 19.99, 34.50, 5, 'Computing');
-- SELECT * FROM JL_BOOKS WHERE ISBN = '9780134589';

-- Test Task 2-1: register an author
-- EXEC sp_register_author('W105', 'Smith', 'John');
-- SELECT * FROM JL_AUTHOR WHERE AUTHORID = 'W105';

-- Test Task 2-2: assign author to book
-- EXEC sp_assign_author('9780134589', 'W105');
-- SELECT * FROM JL_BOOKAUTHOR WHERE ISBN = '9780134589';

-- Test Task 1-3: update a book
-- EXEC sp_book_update('9780134589', 'Science', 21.50, 36.00);
-- SELECT * FROM JL_BOOKS WHERE ISBN = '9780134589';

-- Test Task 3-1: register a customer (with OUT parameter)
-- DECLARE
--   v_num NUMBER;
-- BEGIN
--   sp_register_customer('Alice','Brown','100 Main St','Orlando','FL','32801','N','alice@mail.com', NULL, v_num);
--   DBMS_OUTPUT.PUT_LINE('New customer number: ' || v_num);
-- END;
-- /
