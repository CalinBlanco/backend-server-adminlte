// Requires 
var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

// Importamos modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.put('/:tipo/:id', (req, res, next) => {

  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos válidos de colección
  var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de colección no es válida',
      errors: { message: 'Las extensiones válidas son: ' + tiposValidos.join(', ') }
    });
  }


  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No seleccionó nada',
      errors: { message: 'Debe de seleccionar una imagen.' }
    });
  };

  // Obtener nombre del archivo
  var archivo = req.files.img;
  var nombreCortado = archivo.name.split('.');
  extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Sólo estas extensiones aceptamos
  var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extensión no válida',
      errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
    });
  };

  // Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;


  // Mover el archivo del temporal a un path en específico
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err
      });
    };

    subirPorTipo(tipo, id, nombreArchivo, res);

  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

  if (tipo === 'usuarios') {
    Usuario.findById(id, (err, usuario) => {

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'usuario no existe.',
          errors: { message: 'usuario no existe.' }
        });
      };

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario',
          errors: err
        });
      };

      // Recuperando el path de la imagen antigua
      var pathViejo = './uploads/usuarios/' + usuario.img;

      // Si existe una imagen anterior, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      };

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {

        usuarioActualizado.password = ':(';

        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar imagen de usuario',
            errors: err
          });
        };


        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizado',
          usuarioActualizado
        });
      });

    });
  };


  if (tipo === 'medicos') {
    Medico.findById(id, (err, medico) => {

      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Médico no existe.',
          errors: { message: 'Médico no existe.' }
        });
      };

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar médico',
          errors: err
        });
      };

      // Recuperando el path de la imagen antigua
      var pathViejo = './uploads/medicos/' + medico.img;

      // Si existe una imagen anterior, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      };

      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {

        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar imagen de médico',
            errors: err
          });
        };


        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de médico actualizado',
          medicoActualizado
        });
      });

    });
  };
  if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {

      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Hospital no existe.',
          errors: { message: 'Hospital no existe.' }
        });
      };

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      };

      // Recuperando el path de la imagen antigua
      var pathViejo = './uploads/hospitales/' + hospital.img;

      // Si existe una imagen anterior, la elimina
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      };

      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {

        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar imagen de hospital',
            errors: err
          });
        };


        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de hospital actualizado',
          hospitalActualizado
        });
      });

    });
  };

};


module.exports = app;