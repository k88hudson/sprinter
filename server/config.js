module.exports = function (env) {
  var express = require('express');
  var app = express();
  var bz = require('bz');

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  // Static files
  app.use(express.static('./app'));

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    var config = env.get('ANGULAR');

    res.setHeader('Content-type', 'text/javascript');
    res.send('window.angularConfig = ' + JSON.stringify(config));
  });

  // bz
  var bugzilla = bz.createClient();

  app.get('/bug', function (req, res, next) {
    console.log(req.query);
    bugzilla.searchBugs(req.query, function(err, bugs) {
      if (err) {
        return next(err);
      }
      res.send(bugs);
    })
  });

  return app;
};
