// routes/authors.js - Author registration and book-author assignment (Tasks 2-1 / 2-2)
const express = require('express');
const router = express.Router();
const { callProcedure, query, oracledb } = require('../db');

// GET /api/authors -> all authors (dropdown on the Assign page)
router.get('/', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.AUTHORID, a.LNAME, a.FNAME,
              COUNT(ba.ISBN) AS BOOKCOUNT
         FROM JL_AUTHOR a
         LEFT JOIN JL_BOOK_AUTHOR ba ON ba.AUTHORID = a.AUTHORID
        GROUP BY a.AUTHORID, a.LNAME, a.FNAME
        ORDER BY a.AUTHORID`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/authors -> register an author (calls sp_register_author, 3 parameters)
router.post('/', async (req, res, next) => {
  try {
    const { authorid, lname, fname } = req.body;
    if (!authorid || !lname || !fname) {
      return res.status(400).json({ error: 'Author ID, Last name and First name are all required' });
    }
    await callProcedure(
      `BEGIN
         sp_register_author(:authorid, :lname, :fname);
       END;`,
      {
        authorid: { val: authorid.toUpperCase(), dir: oracledb.BIND_IN },
        lname: { val: lname, dir: oracledb.BIND_IN },
        fname: { val: fname, dir: oracledb.BIND_IN },
      }
    );
    res.status(201).json({ message: `Author ${authorid} registered successfully` });
  } catch (e) { next(e); }
});

// POST /api/authors/assign -> assign an author ID to an ISBN (calls sp_assign_author)
router.post('/assign', async (req, res, next) => {
  try {
    const { isbn, authorid } = req.body;
    if (!isbn || !authorid) {
      return res.status(400).json({ error: 'Both ISBN and Author ID are required' });
    }
    await callProcedure(
      `BEGIN
         sp_assign_author(:isbn, :authorid);
       END;`,
      {
        isbn: { val: isbn, dir: oracledb.BIND_IN },
        authorid: { val: authorid.toUpperCase(), dir: oracledb.BIND_IN },
      }
    );
    res.status(201).json({ message: `Author ${authorid} assigned to book ${isbn}` });
  } catch (e) { next(e); }
});

module.exports = router;
