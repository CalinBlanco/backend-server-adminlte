// Requires 
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// Importamos las variables del config
// var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// ===================================================
// Obterner todos los usuarios
// ===================================================

app.get('/', (req, res, next) => {

  Usuario.find({}, 'nombres apePaterno apeMaterno email img role')
    .exec(
      (err, usuarios) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando usuarios.',
            errors: err
          });
        };

        res.status(200).json({
          ok: true,
          usuarios: usuarios
        });

      });
});


// ===================================================
// Actualizar usuario
// ===================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {


    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err
      });
    };

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario con el id: ' + id + ', no existe.',
        errors: { message: 'No existe un usuario con ese ID.' }
      });
    };

    usuario.nombres = body.nombres;
    usuario.apePaterno = body.apePaterno;
    usuario.apeMaterno = body.apeMaterno;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err
        });
      };

      usuarioActualizado.password = ':(';

      res.status(200).json({
        ok: true,
        body: usuarioActualizado,
        usuarioToken: req.usuario
      });
    });
  });

})



// ===================================================
// Crear un nuevo usuario
// ===================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

  var body = req.body;

  var usuario = new Usuario({
    nombres: body.nombres,
    apePaterno: body.apePaterno,
    apeMaterno: body.apeMaterno,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al guardar usuario.',
        errors: err
      });
    };

    usuarioGuardado.password = ':(';

    res.status(201).json({
      ok: true,
      body: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });


});

// ===================================================
// Borrar un usuario por el id
// ===================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario.',
        errors: err
      });
    };

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese id.',
        errors: { message: 'El usuario con el id: ' + id + ', no existe.' }
      });
    };

    res.status(200).json({
      ok: true,
      body: usuarioBorrado,
      usuarioToken: req.usuario
    });
  });
});



module.exports = app;
