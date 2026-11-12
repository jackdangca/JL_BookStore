-- ============================================================
-- JL (Just Lee) Book Order Application
-- Script 04: Triggers (extra back-end credit)
-- ============================================================

-- ------------------------------------------------------------
-- trg_books_cost_check : before insert/update on JL_BOOKS,
-- make sure COST is not higher than RETAIL.
-- ------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_books_cost_check
BEFORE INSERT OR UPDATE OF COST, RETAIL ON JL_BOOKS
FOR EACH ROW
BEGIN
    IF :NEW.COST IS NOT NULL AND :NEW.RETAIL IS NOT NULL
       AND :NEW.COST > :NEW.RETAIL THEN
        RAISE_APPLICATION_ERROR(-20101,
          'Cost ($' || :NEW.COST || ') cannot be higher than Retail ($' || :NEW.RETAIL || ')');
    END IF;
END;
/

-- ------------------------------------------------------------
-- trg_books_audit : keeps a simple audit trail of book updates
-- (drop blocks below make this script safe to re-run)
-- ------------------------------------------------------------
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE JL_BOOKS_AUDIT';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;  -- ignore "table does not exist"
END;
/

BEGIN
  EXECUTE IMMEDIATE 'DROP SEQUENCE JL_AUDIT_SEQ';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -942 THEN RAISE; END IF;  -- ignore "sequence does not exist"
END;
/

CREATE TABLE JL_BOOKS_AUDIT (
    AUDIT_ID     NUMBER(10)      PRIMARY KEY,
    ISBN         VARCHAR2(10),
    OLD_COST     NUMBER(8,2),
    NEW_COST     NUMBER(8,2),
    OLD_RETAIL   NUMBER(8,2),
    NEW_RETAIL   NUMBER(8,2),
    CHANGED_BY   VARCHAR2(40)    DEFAULT USER,
    CHANGED_ON   DATE            DEFAULT SYSDATE
);

CREATE SEQUENCE JL_AUDIT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE OR REPLACE TRIGGER trg_books_audit
AFTER UPDATE OF COST, RETAIL ON JL_BOOKS
FOR EACH ROW
BEGIN
    IF :OLD.COST <> :NEW.COST OR :OLD.RETAIL <> :NEW.RETAIL THEN
        INSERT INTO JL_BOOKS_AUDIT (AUDIT_ID, ISBN, OLD_COST, NEW_COST, OLD_RETAIL, NEW_RETAIL)
        VALUES (JL_AUDIT_SEQ.NEXTVAL, :OLD.ISBN, :OLD.COST, :NEW.COST, :OLD.RETAIL, :NEW.RETAIL);
    END IF;
END;
/

-- ------------------------------------------------------------
-- trg_orders_shipdate : SHIPDATE cannot be before ORDERDATE
-- ------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_orders_shipdate
BEFORE INSERT OR UPDATE OF SHIPDATE ON JL_ORDERS
FOR EACH ROW
BEGIN
    IF :NEW.SHIPDATE IS NOT NULL AND :NEW.SHIPDATE < :NEW.ORDERDATE THEN
        RAISE_APPLICATION_ERROR(-20102, 'Ship date cannot be earlier than order date');
    END IF;
END;
/

-- ============================================================
-- TEST
-- Try inserting a book where COST > RETAIL — trigger should reject it:
-- INSERT INTO JL_BOOKS (ISBN,TITLE,COST,RETAIL) VALUES ('TEST0001','Bad pricing', 50, 20);
-- Then update a real book's cost and check the audit table:
-- UPDATE JL_BOOKS SET COST = COST + 1 WHERE ROWNUM = 1;
-- SELECT * FROM JL_BOOKS_AUDIT;
-- ============================================================
