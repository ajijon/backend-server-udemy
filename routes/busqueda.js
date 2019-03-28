var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =======================================
//Busqueda por coleccion
//========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regexp);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regexp);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regexp);
            break;

        default:
            return res.status(400).json({
                oK: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }

            });

    }

    promesa.then(data => {

        res.status(200).json({
            oK: true,
            [tabla]: data

        });

    });

});


function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });

    });

}


// =======================================
// Busqueda general
//========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regexp),
            buscarMedicos(busqueda, regexp),
            buscarUsuarios(busqueda, regexp)
        ])
        .then(respuestas => {

            res.status(200).json({
                oK: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            });

        });

});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);

                } else {
                    resolve(hospitales)

                }

            });

    });

}

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp })
            .populate('usuario', 'hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);

                } else {
                    resolve(medicos)
                }

            });

    });

}

function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Erro al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }

            });

    });

}

module.exports = app;