const express = require('express');
const router = express.Router();
const expressCache = require('express-api-cache');
const cache = expressCache.cache;
const axios = require('axios');
const cheerio = require('cheerio');

const sources = require('../sources.json');
const baseUrl = 'https://news.google.com';
const infoTag = 'article h3 a';
const SAMPLELIMIT = 500;
const config = {
    headers: {
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "User-Agent": "Mozilla/5.0"
    }
}

const getUrl = function(source, keyword) {
    if (keyword !== '') {
        keyword += '%20';
    }
    const query = '/search?q='+keyword+'site%3A'+source+'&hl=en-US&gl=US&ceid=US%3Aen';
    return baseUrl + query;
}

async function getNewsFromSource(newslist, source, keyword, n) {
    if (n == 0) {
        return;
    }
    let url = getUrl(source, keyword);
    let response = await axios.get(url, config);
    let html = response.data;
    let $ = cheerio.load(html);

    let count = 0;
    $('article h3 a').each(function () {
        if (count < n) {
            relUrl = $(this).attr('href');
            let article = {
                title: $(this).text(),
                url: baseUrl + relUrl.slice(1, relUrl.length),
                source: source
            }
            let key = Math.random();
            newslist[key] = article;
            count++;
        }
    });
}

async function collectArticles(res, limit, keyword, newslist, biasSources) {
    const numSrcs = Object.keys(biasSources).length;
    const articlesPer = Math.trunc(limit / numSrcs);
    const remArticles = limit % numSrcs;
    for (key in biasSources) {
        try {
            if (key == Object.keys(biasSources)[numSrcs-1]) {
                await getNewsFromSource(newslist, biasSources[key], keyword, articlesPer + remArticles);
            }
            else {
                await getNewsFromSource(newslist, biasSources[key], keyword, articlesPer);
            }
        }
        catch(err) {
            console.log(err);
            res.status(500).json(err);
        }
    }
}

router.get('/left/:keyword?/:limit?', cache('30 minutes'), async (req, res) => {
    let news = {};
    let limit = !req.params.limit ? SAMPLELIMIT : Math.min(req.params.limit, SAMPLELIMIT);
    let keyword = !req.params.keyword ? '' : req.params.keyword;
    console.log(keyword);
    await collectArticles(res, limit, keyword, news, sources.left);
    res.status(200).json(news);
});

router.get('/midleft/:keyword?/:limit?', cache('30 minutes'), async (req, res) => {
    let news = {};
    let limit = !req.params.limit ? SAMPLELIMIT : Math.min(req.params.limit, SAMPLELIMIT);
    let keyword = !req.params.keyword ? '' : req.params.keyword;
    await collectArticles(res, limit, keyword, news, sources.midleft);
    console.log(Object.keys(news).length);
    res.status(200).json(news);
});

router.get('/center/:keyword?/:limit?', cache('30 minutes'), async (req, res) => {
    let news = {};
    let limit = !req.params.limit ? SAMPLELIMIT : Math.min(req.params.limit, SAMPLELIMIT);
    let keyword = !req.params.keyword ? '' : req.params.keyword;
    await collectArticles(res, limit, keyword, news, sources.center);
    console.log(Object.keys(news).length);
    res.status(200).json(news);
});

router.get('/midright/:keyword?/:limit?', cache('30 minutes'), async (req, res) => {
    let news = {};
    let limit = !req.params.limit ? SAMPLELIMIT : Math.min(req.params.limit, SAMPLELIMIT);
    let keyword = !req.params.keyword ? '' : req.params.keyword;
    await collectArticles(res, limit, keyword, news, sources.midright);
    console.log(Object.keys(news).length);
    res.status(200).json(news);
});

router.get('/right/:keyword?/:limit?', cache('30 minutes'), async (req, res) => {
    let news = {};
    let limit = !req.params.limit ? SAMPLELIMIT : Math.min(req.params.limit, SAMPLELIMIT);
    let keyword = !req.params.keyword ? '' : req.params.keyword;
    await collectArticles(res, limit, keyword, news, sources.right);
    console.log(Object.keys(news).length);
    res.status(200).json(news);
});

module.exports = router;