const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { performance } = require('perf_hooks');
const path = require('path');
require('dotenv').config()

const app = express();
const port = process.env.SERVER_PORT || 3004;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: process.env.DB_PORT
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use('/api/cnpj/', require('./routes/api_cnpj')); // GET /api/cnpj/:cnpj
app.use('/cnpj/', require('./routes/view_cnpj')); // GET /cnpj/:cnpj
app.use('/api/search', require('./routes/search')); // GET /api/search?query=term
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});
app.use('/sitemap/', require('./routes/sitemap')); // GET /api/search?query=term

app.get('/statistic', async (req, res) => {
    const query = `select count(distinct(cnpj)) as cnpjs, count(cnpj) as qtde, avg(time_ms) as avg_time from public.events where status = 1;`
    const result = await req.pool.query(query);

    res.json(result.rows[0])
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});
