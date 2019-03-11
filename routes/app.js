var express = require('express');

var app = express();

app.get('/', (req, res, next) => {

    res.status(200).json({
        oK: true,
        mensaje: 'Peticion realizada correctamente port 3000'

    });

});

module.exports = app;