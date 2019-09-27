const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodejs-express-db');
mongoose.Promise = global.Promise;

module.exports = mongoose;