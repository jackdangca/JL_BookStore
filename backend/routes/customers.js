// routes/customers.js - Customer registration and update (Tasks 3-1 / 3-2)
const express = require('express');
const router = express.Router();
const { callProcedure, query, oracledb } = require('../db');

// GET /api/customers -> all customers (for the update page dropdown/grid)
// The course schema's key column is CUSTOMER#; alias it back to
// CUSTOMERNUMBER so the React pages keep working unchanged.
router.get('/', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT "CUSTOMER#" AS "CUSTOMERNUMBER", FIRSTNAME, LASTNAME, ADDRESS, CITY, STATE,
              ZIP, REGION, EMAIL, REFERRED
         FROM JL_CUSTOMERS
        ORDER BY "CUSTOMER#"`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/customers/:id -> one customer (load into the update form)
router.get('/:id', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT "CUSTOMER#" AS "CUSTOMERNUMBER", FIRSTNAME, LASTNAME, ADDRESS, CITY, STATE,
              ZIP, REGION, EMAIL, REFERRED
         FROM JL_CUSTOMERS
        WHERE "CUSTOMER#" = :id`,
      [Number(req.params.id)]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/customers -> register a customer (calls sp_register_customer, OUT returns new number)
router.post('/', async (req, res, next) => {
  try {
    const { firstname, lastname, address, city, state, zip, region, email, referred } = req.body;
    if (!lastname) {
      return res.status(400).json({ error: 'Last name is required' });
    }
    const result = await callProcedure(
      `BEGIN
         sp_register_customer(:fname, :lname, :address, :city, :state,
                              :zip, :region, :email, :referred, :custnum);
       END;`,
      {
        fname: { val: firstname || null, dir: oracledb.BIND_IN },
        lname: { val: lastname, dir: oracledb.BIND_IN },
        address: { val: address || null, dir: oracledb.BIND_IN },
        city: { val: city || null, dir: oracledb.BIND_IN },
        state: { val: (state || '').toUpperCase() || null, dir: oracledb.BIND_IN },
        zip: { val: zip || null, dir: oracledb.BIND_IN },
        region: { val: (region || '').toUpperCase() || null, dir: oracledb.BIND_IN },
        email: { val: email || null, dir: oracledb.BIND_IN },
        referred: { val: referred ? Number(referred) : null, dir: oracledb.BIND_IN },
        custnum: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    const newNumber = result.outBinds.custnum;
    res.status(201).json({ message: `Customer registered`, customernumber: newNumber });
  } catch (e) { next(e); }
});

// PUT /api/customers/:id -> update address/city/state/region/email (calls sp_update_customer)
router.put('/:id', async (req, res, next) => {
  try {
    const { address, city, state, region, email } = req.body;
    await callProcedure(
      `BEGIN
         sp_update_customer(:custnum, :address, :city, :state, :region, :email);
       END;`,
      {
        custnum: { val: Number(req.params.id), dir: oracledb.BIND_IN },
        address: { val: address || null, dir: oracledb.BIND_IN },
        city: { val: city || null, dir: oracledb.BIND_IN },
        state: { val: (state || '').toUpperCase() || null, dir: oracledb.BIND_IN },
        region: { val: (region || '').toUpperCase() || null, dir: oracledb.BIND_IN },
        email: { val: email || null, dir: oracledb.BIND_IN },
      }
    );
    res.json({ message: `Customer ${req.params.id} updated successfully` });
  } catch (e) { next(e); }
});

module.exports = router;
