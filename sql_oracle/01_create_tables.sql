-- ============================================================
-- JL (Just Lee) Book Order Application
-- Script 01: Table creation (Oracle 12c)
-- Run this FIRST in SQL Developer, connected to your JL_XXXX schema.
--
-- IMPORTANT (COMP214 course schema): the school schema already contains
-- the JustLee tables (JL_BOOKS, JL_AUTHOR, JL_BOOKAUTHOR, JL_CUSTOMERS,
-- JL_PUBLISHER, JL_ORDERS, JL_ORDERITEMS) with their data. On that schema
-- SKIP this script and script 05 - only run 02, 03, 04 and the two
-- CREATE SEQUENCE statements at the bottom (with START WITH values above
-- the current max customer#/order#).
--
-- This script matches the textbook naming: the customer key column is
-- "CUSTOMER#" (quoted identifier) and the bridge table is JL_BOOKAUTHOR.
-- ============================================================

-- Clean up previous runs (safe to re-run)
BEGIN
  FOR t IN (SELECT table_name FROM user_tables
            WHERE table_name IN ('JL_ORDERITEMS','JL_ORDERS','JL_BOOKAUTHOR',
                                 'JL_CUSTOMERS','JL_AUTHOR','JL_BOOKS','JL_PUBLISHER')) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
  END LOOP;
END;
/

-- 1. Publishers
CREATE TABLE JL_PUBLISHER (
    PUBID     NUMBER(4)      PRIMARY KEY,
    NAME      VARCHAR2(50)   NOT NULL,
    CONTACT   VARCHAR2(50),
    PHONE     VARCHAR2(15)
);

-- 2. Books
CREATE TABLE JL_BOOKS (
    ISBN       VARCHAR2(10)   PRIMARY KEY,
    TITLE      VARCHAR2(100)  NOT NULL,
    PUBDATE    DATE,
    PUBID      NUMBER(4)      REFERENCES JL_PUBLISHER(PUBID),
    COST       NUMBER(8,2),
    RETAIL     NUMBER(8,2),
    DISCOUNT   NUMBER(4,2)    DEFAULT 0,
    CATEGORY   VARCHAR2(30)
);

-- 3. Authors
CREATE TABLE JL_AUTHOR (
    AUTHORID   VARCHAR2(6)    PRIMARY KEY,
    LNAME      VARCHAR2(40)   NOT NULL,
    FNAME      VARCHAR2(40)   NOT NULL
);

-- 4. Book <-> Author bridge (a book can have many authors)
CREATE TABLE JL_BOOKAUTHOR (
    ISBN       VARCHAR2(10)   REFERENCES JL_BOOKS(ISBN),
    AUTHORID   VARCHAR2(6)    REFERENCES JL_AUTHOR(AUTHORID),
    CONSTRAINT PK_BOOKAUTHOR PRIMARY KEY (ISBN, AUTHORID)
);

-- 5. Customers (key column is "CUSTOMER#" like the textbook schema)
CREATE TABLE JL_CUSTOMERS (
    "CUSTOMER#"     NUMBER(6)      PRIMARY KEY,
    FIRSTNAME       VARCHAR2(40),
    LASTNAME        VARCHAR2(40)   NOT NULL,
    ADDRESS         VARCHAR2(80),
    CITY            VARCHAR2(40),
    STATE           VARCHAR2(2),
    ZIP             VARCHAR2(10),
    REGION          VARCHAR2(10),
    EMAIL           VARCHAR2(80),
    REFERRED        NUMBER(6)      REFERENCES JL_CUSTOMERS("CUSTOMER#")
);

-- 6. Orders (extra credit / used by the demo menu)
CREATE TABLE JL_ORDERS (
    ORDER#        NUMBER(8)      PRIMARY KEY,
    "CUSTOMER#"   NUMBER(6)      REFERENCES JL_CUSTOMERS("CUSTOMER#"),
    ORDERDATE     DATE           DEFAULT SYSDATE,
    SHIPDATE      DATE,
    SHIPSTREET    VARCHAR2(80),
    SHIPCITY      VARCHAR2(40),
    SHIPSTATE     VARCHAR2(2),
    SHIPZIP       VARCHAR2(10),
    SHIPCOST      NUMBER(8,2)
);

-- 7. Order items (extra credit / used by the demo menu)
CREATE TABLE JL_ORDERITEMS (
    ORDER#       NUMBER(8)     REFERENCES JL_ORDERS(ORDER#),
    ITEM#        NUMBER(4),
    ISBN         VARCHAR2(10)  REFERENCES JL_BOOKS(ISBN),
    QUANTITY     NUMBER(4)     NOT NULL,
    PAIDEACH     NUMBER(8,2)   NOT NULL,
    CONSTRAINT PK_ORDERITEMS PRIMARY KEY (ORDER#, ITEM#)
);

COMMIT;

-- ============================================================
-- Sequences for auto IDs (customers / orders)
-- On the course schema create them with START WITH above the
-- current max values, e.g.:
--   SELECT NVL(MAX("CUSTOMER#"),1000)+1 FROM JL_CUSTOMERS;
--   SELECT NVL(MAX(ORDER#),5000)+1     FROM JL_ORDERS;
-- ============================================================
CREATE SEQUENCE JL_CUSTOMER_SEQ  START WITH 1001 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE JL_ORDER_SEQ     START WITH 5001  INCREMENT BY 1 NOCACHE;
