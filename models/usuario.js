// Requires
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var rolesValidos = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} no es un rol permitido.'
};


var usuarioSchema = new Schema({
  'nombres': { type: String, required: [true, 'Los nombres son necesarios'] },
  'apePaterno': { type: String, required: [true, 'El apellido paterno es necesario'] },
  'apeMaterno': { type: String, required: [true, 'El apellido materno es necesario'] },
  'email': { type: String, unique: true, required: [true, 'El email es necesario'] },
  'password': { type: String, required: [true, 'La contraseña es necesaria'] },
  'img': { type: String, required: false },
  'role': { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
  'google': { type: Boolean, required: true, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único.' })

module.exports = mongoose.model('Usuario', usuarioSchema);