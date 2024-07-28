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

// execute REFRESH MATERIALIZED VIEW public.events_summary; a cada 10 minutos
setInterval(async () => {
    const query = `REFRESH MATERIALIZED VIEW public.events_summary;`
    await pool.query(query);
}, 600000);

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

// 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.get('/statistic', async (req, res) => {
    const query = `SELECT * FROM public.events_summary;`
    const result = await req.pool.query(query);

    res.json(result.rows[0])
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
});