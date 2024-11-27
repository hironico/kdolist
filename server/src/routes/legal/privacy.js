const express = require('express');
const privacyApi = express.Router();
const fs = require('fs/promises');

privacyApi.get('/privacy', (req, res) => {
    fs.readFile('../client/public/privacy.txt')
    .then(data => {
        res.status(200).header('Content-Type', 'text/text').send(data).end();
    })
    .catch(error => {
        res.status(500).send(error).end();
    });
});


  module.exports = { privacyApi };