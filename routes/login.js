var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                oK: false,
                mensaje: 'Error al buscar usuario',
                errors: err

            });
        }

        if (!usuarioDB) {

            return res.status(400).json({
                oK: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err

            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                oK: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err

            });
        }

        // Crear un token !!!
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 hrs (14400/60 result/60 = 4 hrs)


        res.status(200).json({
            oK: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id

        });

    });

});











module.exports = app;