// Requires 
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


// ===================================================
// Obtener todos los médicos
// ===================================================

app.get('/', (req, res) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombres apePaterno apeMaterno email')
    .populate('hospital', 'nombre')
    .exec(
      (err, medicos) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando médicos.',
            errors: err
          });
        };

        Medico.count({}, (err, conteo) => {

          res.status(200).json({
            ok: true,
            médicos: medicos,
            total: conteo
          });
        });

      });
});

// ===================================================
// Actualizar médico por el id
// ===================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar médico,',
        errors: err
      });
    };

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El médico con el id: ' + id + ', no existe',
        errors: err
      });
    };

    medico.nombres = body.nombres;
    medico.apePaterno = body.apePaterno;
    medico.apeMaterno = body.apeMaterno;
    // medico.img = body.img;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar médico',
          error: err
        });
      };

      res.status(200).json({
        ok: true,
        body: medicoActualizado,
        usuarioToken: req.usuario._id
      });
    });

  });
});

// ===================================================
// Crear un médico
// ===================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombres: body.nombres,
    apePaterno: body.apePaterno,
    apeMaterno: body.apeMaterno,
    // img: body.img,
    hospital: body.hospital,
    usuario: req.usuario._id
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: 'Error al guardar médico',
        error: err
      });
    };

    res.status(200).json({
      ok: true,
      body: medicoGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ===================================================
// Borrar médico por id
// ===================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(200).json({
        ok: false,
        mensaje: 'Error al borrar médico',
        errors: err
      });
    };

    if (!medicoBorrado) {
      res.status(400).json({
        ok: false,
        mensaje: 'No existe un médico con ese id',
        errors: { mensaje: 'No existe el médico con el id: ' + id }
      });
    };

    res.status(200).json({
      ok: true,
      body: medicoBorrado,
      usuarioToken: req.usuario
    });
  });
});

module.exports = app;