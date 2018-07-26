// Requires 
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Importamos las variables del config
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ===================================================
// Autenticación con Google
// ===================================================
app.post('/google', (req, res) => {

  var token = req.body.token || 'fasdfadsfrvxczb';

  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

  // res.status(200).json({
  //   ok: true,
  //   client
  // });

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    Usuario.findOne({ email: payload.email }, (err, usuario) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuario - login',
          errors: err
        });
      };

      if (usuario) {
        if (usuario.google === false) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Debe de usar su autenticación del sistema'
          });
        } else {
          // Crear un token!!!
          usuario.password = ":(";
          var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });  //  4 horas expresado en segundos

          res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto.',
            usuario: usuario,
            token: token,
            id: usuario._id
          });
        };
        // Si el usuario no existe por correo
      } else {
        var usuario = new Usuario();

        var apellidos = payload.family_name.split(' ');

        usuario.nombres = payload.given_name;
        usuario.apePaterno = apellidos[0];
        usuario.apeMaterno = apellidos[1];
        usuario.email = payload.email;
        usuario.password = ":(";
        usuario.img = payload.picture;
        usuario.google = true;

        usuario.save((err, usuarioDB) => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al crear usuario - Google',
              errors: err
            });
          };

          // Crear un token!!!
          usuario.password = ":(";
          var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });  //  4 horas expresado en segundos

          res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto.',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
          });

        });

      };


    });


    // res.status(200).json({
    //   ok: true,
    //   mensaje: payload
    // });
  };
  verify().catch(console.error);
});



// ===================================================
// Autenticación Normal
// ===================================================

app.post('/', (req, res) => {

  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario.',
        errors: err
      });
    };

    if (!usuarioBD) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: err
      });
    };

    if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: err
      });
    };

    // Crear un token!!!
    usuarioBD.password = ":(";
    var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });  //  4 horas expresado en segundos

    res.status(200).json({
      ok: true,
      mensaje: 'Login post correcto.',
      usuario: usuarioBD,
      token: token,
      id: usuarioBD._id
    });

  });

});



module.exports = app;