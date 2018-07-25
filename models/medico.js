var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
  nombres: {type: String, required: [true, 'Los nombres son necesarios.']},
  apePaterno: {type: String, required: [true, 'El apellido paterno necesarios.']},
  apeMaterno: {type: String, required: [true, 'El apellido Materno necesarios.']},
  img: {type: String, required:false},
  usuario: {type: Schema.Types.ObjectId, ref: 'Usuario', required: true},
  hospital: {type: Schema.Types.ObjectId, ref: 'Hospital', required:[true,'El id hospital es un campo obligatorio.']}
});

module.exports = mongoose.model('Medico', medicoSchema);