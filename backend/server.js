'use strict';

var express = require('express');
var parser = require('body-parser');
var mongoose = require('mongoose');


// mongoose.connect('mongodb://localhost/nopack', function(err) {
//   if (err) {
//     console.log('Failed connecting to MongoDB!');
//   } else {
//     console.log('Successfully connected to MongoDB!');
//   }
// });


var app = express();


app.use('/', express.static('frontend'));
app.use(parser.json());



app.listen(3000, function() {
    console.log("The server is running on port 3000!");
});
