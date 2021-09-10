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
            SELECT c.code, c.name, c.description, i.in_code, i.industry FROM companies AS c
            RIGHT JOIN comp_inds AS ci
            ON c.code = ci.comp_code
            RIGHT JOIN industries AS i
            ON ci.ind_code = i.in_code 
            WHERE code = $1`,
            [req.params.code]
        );
        if(results.rows.length === 0){
            let notFound = new ExpressError(`There is no company with code of ${req.params.code}`);
            notFound.status = 404;
            throw notFound;
        }

        // return res.json(results.rows)

        const { code, name, description } = results.rows[0]
        const company = { code, name, description }
        const industries = []
        for(let r of results.rows){
            let ind = {ind_code: r.in_code, industry: r.industry}
            industries.push(ind)
        }
        company.industries = industries

        const invoices = await db.query(`
            SELECT * FROM invoices
            WHERE comp_code = $1`,
            [req.params.code]       
        )
        company.invoices = invoices.rows
        return res.json({company: company})
    } catch(e){
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try{
        const { code, name, description } = req.body;

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

router.put('/:code', async (req, res, next) => {
    try{
        const { name, description } = req.body;

        const result = await db.query(
            `UPDATE companies 
            SET name=$2, description=$3
            WHERE code = $1
            RETURNING code, name, description`,
            [req.params.code, name, description]
        );

        if(result.rows.length === 0){
            let notFound = new ExpressError(`There is no company with code of ${req.params.code}`);
            notFound.status = 404;
            throw notFound;
        }

        return res.json({company: result.rows[0]})

    } catch(e) {
        next(e);
    };
});

router.delete('/:code', async (req, res, next) => {
    try{
        const result = await db.query(
            `DELETE FROM companies
            WHERE code=$1`,
            [req.params.code]
        )
        return res.json({status: "deleted"})
    }catch(e){
        next(e)
    }
});

module.exports = router;