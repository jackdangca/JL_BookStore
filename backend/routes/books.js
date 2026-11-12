// routes/books.js - Book registration, listing and update (Tasks 1-1 / 1-2 / 1-3)
const express = require('express');
const router = express.Router();
const { callProcedure, query, oracledb } = require('../db');

// GET /api/books  -> list all books (for the grid page)
router.get('/', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT b.ISBN, b.TITLE, b.PUBDATE, b.PUBID, p.NAME AS PUBLISHER,
              b.COST, b.RETAIL, b.DISCOUNT, b.CATEGORY,
              NVL(b.RETAIL,0) - NVL(b.COST,0) AS PROFIT
         FROM JL_BOOKS b
         LEFT JOIN JL_PUBLISHER p ON p.PUBID = b.PUBID
        ORDER BY b.TITLE`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/books/publishers -> dropdown data
router.get('/publishers', async (req, res, next) => {
  try {
    const rows = await query(`SELECT PUBID, NAME FROM JL_PUBLISHER ORDER BY PUBID`);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/books/:isbn/authors -> authors of one book (for the demo / verify assignment)
router.get('/:isbn/authors', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.AUTHORID, a.LNAME, a.FNAME
         FROM JL_BOOKAUTHOR ba
         JOIN JL_AUTHOR a ON a.AUTHORID = ba.AUTHORID
        WHERE ba.ISBN = :isbn
        ORDER BY a.LNAME`,
      [req.params.isbn]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/books -> register a book (calls sp_Book_register, 8 parameters)
router.post('/', async (req, res, next) => {
  try {
    const { isbn, title, pubdate, pubid, cost, retail, discount, category } = req.body;
    if (!isbn || !title) {
      return res.status(400).json({ error: 'ISBN and Title are required' });
    }
    await callProcedure(
      `BEGIN
         sp_Book_register(:isbn, :title,
                          TO_DATE(:pubdate, 'YYYY-MM-DD'),
                          :pubid, :cost, :retail, :discount, :category);
       END;`,
      {
        isbn: { val: isbn, dir: oracledb.BIND_IN },
        title: { val: title, dir: oracledb.BIND_IN },
        pubdate: { val: pubdate || null, dir: oracledb.BIND_IN },
        pubid: { val: pubid ? Number(pubid) : null, dir: oracledb.BIND_IN },
        cost: { val: cost !== '' && cost != null ? Number(cost) : null, dir: oracledb.BIND_IN },
        retail: { val: retail !== '' && retail != null ? Number(retail) : null, dir: oracledb.BIND_IN },
        discount: { val: discount !== '' && discount != null ? Number(discount) : 0, dir: oracledb.BIND_IN },
        category: { val: category || null, dir: oracledb.BIND_IN },
      }
    );
    res.status(201).json({ message: `Book ${isbn} registered successfully` });
  } catch (e) { next(e); }
});

// PUT /api/books/:isbn -> update ONLY category / cost / retail (calls sp_book_update)
router.put('/:isbn', async (req, res, next) => {
  try {
    const { category, cost, retail } = req.body;
    await callProcedure(
      `BEGIN
         sp_book_update(:isbn, :category, :cost, :retail);
       END;`,
      {
        isbn: { val: req.params.isbn, dir: oracledb.BIND_IN },
        category: { val: category || null, dir: oracledb.BIND_IN },
        cost: { val: cost !== '' && cost != null ? Number(cost) : null, dir: oracledb.BIND_IN },
        retail: { val: retail !== '' && retail != null ? Number(retail) : null, dir: oracledb.BIND_IN },
      }
    );
    res.json({ message: `Book ${req.params.isbn} updated successfully` });
  } catch (e) { next(e); }
});

module.exports = router;
