var express = require('express');
var router = express.Router();
const { Client } = require('@elastic/elasticsearch')

router.get('/', async (req, res) => {

    const client = new Client({
        node: 'http://localhost:9200',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const query = req.query.query;

    if (query.length < 3) {
        return res.status(400).json({ error: 'Query deve ter pelo menos 3 caracteres' });
    }

    try {
        const { body } = await client.search({
            index: 'opencnpj',
            size: 100,
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: ['razao_social', 'nome_fantasia', 'cnpj']
                    }
                }
            }
        });
    
        res.json(body);
    } catch (error) {
        console.error('Erro ao buscar no Elasticsearch', error);
        res.status(500).json({ error: 'Erro ao realizar a consulta' });
    }

})

module.exports = router;