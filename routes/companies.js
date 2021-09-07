const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});
    } catch(e) {
        return next(e);
    };
});

router.get('/:code', async (req, res, next) => {
    try{
        const results = await db.query(`
            SELECT * FROM companies 
            WHERE code = $1`,
            [req.params.code]
        );

        if(results.rows.length === 0){
            let notFound = new ExpressError(`There is no company with code of ${req.params.code}`);
            notFound.status = 404;
            throw notFound;
        }

        return res.json({company: results.rows[0]})
    } catch(e){
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try{
        const code = req.body.code;
        const name = req.body.name;
        const description = req.body.description;

        const results = await db.query(`
            INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
            )

        return res.status(201).json({company: results.rows[0]})
    } catch(e) {
        next(e)
    }
})

module.exports = router;