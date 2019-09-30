const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

require('./controllers/authController')(app);
require('./controllers/roomTypeController')(app);

app.listen(4000);