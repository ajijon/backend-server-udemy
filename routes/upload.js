var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion lecc 127 min 5:00
    var tiposvalidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposvalidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            oK: false,
            mensaje: 'Tipo de coleccion no válida',
            errors: { message: 'Las colecciones validas son:' + tiposvalidos.join(' , ') }

        });

    }

    if (!req.files) {
        return res.status(400).json({
            oK: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }

        });

    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]

    // Sólo estas extensiones aceptamos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            oK: false,
            mensaje: 'Extension no válida',
            errors: { message: ' Las extensiones válidas son: ' + extensionesValidas.join(' , ') }

        });

    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;


    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                oK: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

// subir imagen por tipo de coleccion
function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    oK: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si esxiste, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);

            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ' :) ';

                return res.status(200).json({
                    oK: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado

                });

            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    oK: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //si esxiste, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);

            }

            medico.img = nombreArchivo;

            return medico.save((err, medicoActualizado) => {

                res.status(200).json({
                    oK: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado

                });

            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    oK: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si esxiste, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);

            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    oK: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado

                });

            })

        });

    }

}

module.exports = app;