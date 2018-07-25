// Requires 
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ===================================================
// Obterner todos los hospitales
// ===================================================

app.get('/', (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombres apePaterno apeMaterno email role')
    .exec(
      (err, hospitales) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando hospitales.',
            errors: err
          });
        };

        Hospital.count({}, (err, conteo) => {

          res.status(200).json({
            ok: true,
            hospitales: hospitales,
            total: conteo
          });

        });

      });
});

// ===================================================
// Actualizar hospital por el id
// ===================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital',
        errors: err
      });
    };

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El hospital con el id: ' + id + ', no existe',
        errors: err
      });
    };

    hospital.nombre = body.nombre;
    // hospital.img = body.img;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          error: err
        });
      };

      res.status(200).json({
        ok: true,
        body: hospitalActualizado,
        usuarioToken: req.usuario._id
      });
    });
  });
});

// ===================================================
// Crear un hospital
// ===================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    // img: body.img,
    usuario: req.usuario._id
  });


  hospital.save((err, hospitalGuardado) => {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al guardar hospital',
        error: err
      });
    };

    res.status(200).json({
      ok: true,
      body: hospitalGuardado,
      usuarioToken: req.usuario
    });
  });

});

// ===================================================
// Borrar un hospital por el id
// ===================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar hospital',
        errors: err
      });
    };

    if (!hospitalBorrado) {
      res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese id',
        errors: { mensaje: 'No existe el hospital con el id: ' + id }
      });
    };

    res.status(200).json({
      ok: true,
      body: hospitalBorrado,
      usuarioToken: req.usuario
    });
  });
});



module.exports = app;
