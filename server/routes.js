/**
 * Main application routes
 */

'use strict';
var express = require('express'); 
var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {
  app.use(express.static(__dirname + '/static'));
  // Insert routes below
  app.use('/api/osms', require('./api/osm'));
  app.use('/api/things', require('./api/thing'));
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
