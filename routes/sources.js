const express = require('express');
const router = express.Router();

const sources = require('../sources.json');
const { left, midleft, center, midright, right } = sources;

router.get('/', (req, res) => {
    res.status(200).json(sources);
});

router.get('/left', (req, res) => {
    res.status(200).json(left);
});

router.get('/midleft', (req, res) => {
    res.status(200).json(midleft);
});

router.get('/center', (req, res) => {
    res.status(200).json(center);
});

router.get('/midright', (req, res) => {
    res.status(200).json(midright);
});

router.get('/right', (req, res) => {
    res.status(200).json(right);
});

module.exports = router;