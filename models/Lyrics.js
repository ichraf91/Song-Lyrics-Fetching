var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Lyrics = new Schema({
    id: String,
    content: String

});


module.exports= mongoose.model('Lyrics',Lyrics);