

const express = require('express');
const { webScraper, sayhello } = require('./scrape');
const { addSite, addContext } = require('./account');

const app = express();
const cors = require('cors');
const port = 8080;

app.use(express.json());
app.use(cors());

// app.get('/', (req, res) => {
//     console.log("server running!");
// });

app.post('/scrape', async (req, res) => {
    const userContext = JSON.parse(req.body);
    try { 
        console.log(userContext)
        const data = await sayhello(userContext);
        res.json(data);
    } catch (error) {
        res.status(500).send({ error: 'Scraping failed', details: error.message });
    }
});

app.post('/add/site', async (req, res) => {
    const {site, context} = JSON.parse(req.body);
    addSite(site, context);

})

app.post('/add/context', async (req, res) => {

})

app.listen(port, () => { console.log(`Application listening on port ${port}.`) });


// process.on('')
// app.close(() => {
//     console.log('Server closed for new connections and existing connections are terminated.');
//     process.exit(0);
// })
