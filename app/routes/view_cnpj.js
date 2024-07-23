var express = require('express');
var router = express.Router();
const BasicCNPJ = require('./functions/basic_cnpj');

const dbschema = process.env.DB_SCHEMA

router.get('/*', async (req, res) => {

    cnpj = req.params[0] || '';

    if(cnpj === '') {
        res.redirect('/');
        return;
    }
    
    cnpj = cnpj.split('-')[0];

    let basicCNPJ = new BasicCNPJ();

    let result = await basicCNPJ.getCnpj(cnpj, req);

    const otherCompanies = `
        WITH base AS (
            SELECT 
                cnpj_basico,
                cnpj_ordem,
                cnpj_dv,
                LEFT(nome_fantasia, 50) as nome_fantasia
            FROM `+ dbschema + `.estabelecimentos TABLESAMPLE BERNOULLI (1) LIMIT 4
        )	
        SELECT 
            LEFT(emp.razao_social, 70) as razao_social,
            base.nome_fantasia,
            CONCAT(base.cnpj_basico, base.cnpj_ordem, base.cnpj_dv) AS cnpj
        FROM base
        INNER JOIN `+ dbschema + `.empresas AS emp
            ON base.cnpj_basico = emp.cnpj_basico
    `;

    const resultOtherCompanies = await req.pool.query(otherCompanies);

    res.render('cnpj', {cnpj: result, otherCompanies: resultOtherCompanies.rows});

});

module.exports = router;