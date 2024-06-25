var express = require('express');
var router = express.Router();
const dbschema = process.env.DB_SCHEMA

router.get('/*', async (req, res) => {

    page = req.params[0] || '';

    if(page === '') {
        res.status(400).send('Página inválida');
        return;
    }

    offset = (page - 1) * 50000;

    try {
        const sitemap = await req.pool.query(`
            SELECT cnpj_basico, cnpj_ordem, cnpj_dv, nome_fantasia 
            FROM ${dbschema}.estabelecimentos 
            WHERE situacao_cadastral='2'  
            ORDER BY cnpj_basico, cnpj_ordem 
            OFFSET $1 
            LIMIT 50
        `, [offset]);

        html_response = ''
        console.log(sitemap.rows)
        for (let i = 0; i < sitemap.rows.length; i++) {
            html_response += `${sitemap.rows[i].cnpj_basico}${sitemap.rows[i].cnpj_ordem}${sitemap.rows[i].cnpj_dv} - ${sitemap.rows[i].nome_fantasia}\n`
        }

        res.status(200).send(html_response);
    } catch (error) {
        console.error('Erro ao consultar o banco de dados', error);
        return 500;
    }    
})

module.exports = router;