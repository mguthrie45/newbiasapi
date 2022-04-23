const PORT = 8000;

const express = require('express');
const cheerio = require('cheerio');
const app = express();
require('dotenv').config();

const articleRoute = require('./routes/articles');
const sourceRoute = require('./routes/sources');

app.use(express.json())

app.use('/articles/', articleRoute);
app.use('/sources/', sourceRoute);

app.listen(process.env.PORT, () => {
    console.log("SERVER RUNNING");
});