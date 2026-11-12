-- ============================================================
-- JL (Just Lee) Book Order Application
-- Script 03: Functions (extra back-end credit)
-- ============================================================

-- ------------------------------------------------------------
-- fn_book_profit : returns the profit (retail - cost) of one book
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_book_profit (
    par_isbn IN JL_BOOKS.ISBN%TYPE
) RETURN NUMBER IS
    v_profit NUMBER;
BEGIN
    SELECT NVL(RETAIL, 0) - NVL(COST, 0)
      INTO v_profit
      FROM JL_BOOKS
     WHERE ISBN = par_isbn;

    RETURN v_profit;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END fn_book_profit;
/

-- ------------------------------------------------------------
-- fn_books_in_category : how many books exist in a category
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_books_in_category (
    par_category IN JL_BOOKS.CATEGORY%TYPE
) RETURN NUMBER IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
      FROM JL_BOOKS
     WHERE UPPER(CATEGORY) = UPPER(par_category);

    RETURN v_count;
END fn_books_in_category;
/

-- ------------------------------------------------------------
-- fn_customer_name : formatted "FNAME LNAME" for a customer
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_customer_name (
    par_custnum IN JL_CUSTOMERS."CUSTOMER#"%TYPE
) RETURN VARCHAR2 IS
    v_name VARCHAR2(81);
BEGIN
    SELECT FIRSTNAME || ' ' || LASTNAME
      INTO v_name
      FROM JL_CUSTOMERS
     WHERE "CUSTOMER#" = par_custnum;

    RETURN v_name;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Unknown customer';
END fn_customer_name;
/

-- ============================================================
-- TEST SECTION
-- ============================================================
-- SELECT fn_book_profit('1059831198') AS profit FROM dual;
-- SELECT fn_books_in_category('COMPUTER') AS total FROM dual;
-- SELECT fn_customer_name(1011) AS name FROM dual;
