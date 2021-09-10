const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});
    } catch(e) {
        return next(e);
    };
});

router.get('/:id', async (req, res, next) => {
    try{
        const results = await db.query(`
            SELECT * FROM invoices 
            WHERE id = $1`,
            [req.params.id]
        );

        if(results.rows.length === 0){
            let notFound = new ExpressError(`There is no invoice with id of ${req.params.id}`);
            notFound.status = 404;
            throw notFound;
        }

        return res.json({invoice: results.rows[0]})
    } catch(e){
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;

        const results = await db.query(`
            INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [ comp_code, amt ])

        return res.status(201).json({invoice: results.rows[0]})
    } catch(e) {
        next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try{
        let { amt, paid } = req.body;

        //gets current paid date to see if it is null or not
        const iRes = await db.query(`
            SELECT paid_date FROM invoices 
            WHERE id = $1`,
            [req.params.id]
        )
        if(iRes.rows.length === 0){
            let notFound = new ExpressError(`There is no invoice with id of ${req.params.id}`, 404);
            throw notFound;
        }

        let date
        if(paid){
            date = iRes.rows[0].paid_date ? 'i.paid_date' : 'CURRENT_DATE'    
        }else{
            date = null
        }        
        const result = await db.query(`
            UPDATE invoices AS i
            SET amt=$1, paid=$2, paid_date=${date}
            WHERE id = $3
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, req.params.id]
        );
        return res.json({invoice: result.rows[0]})

    } catch(e) {
        next(e);
    };
});

router.delete('/:id', async (req, res, next) => {
    try{
        const result = await db.query(`
            DELETE FROM invoices
            WHERE id=$1`,
            [req.params.id]
        )
        return res.json({status: "deleted"})
    }catch(e){
        next(e)
    }
});

module.exports = router;