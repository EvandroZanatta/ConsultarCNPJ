var express = require('express');
var router = express.Router();
const BasicCNPJ = require('./functions/basic_cnpj');

// router.get('/', async function (req, res, next) {
router.get('/*', async (req, res) => {

    console.log(req.params)

    cnpj = req.params[0] || '';

    if(cnpj === '') {
        res.status(400).json({ error: 'CNPJ inválido' });
        return false;
    }

    // initialize BasicCNPJ
    let basicCNPJ = new BasicCNPJ();

    // get cnpj from request
    let result = await basicCNPJ.getCnpj(cnpj, req);

    if(result === 500) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }else{
        res.json(result);
    }

});

module.exports = router;