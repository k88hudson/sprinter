module.exports = function(env, app, dbInit) {

  var db = require('./dbController')(dbInit);

  // Healthcheck
  app.get('/', function(req, res) {
    res.send('Webmaker Events Service is up and running');
  });

  // auth
  app.all('/oauth/token', app.oauth.grant());
  app.get('/test', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
  });


  app.get('/milestone', db.get.all);
  app.get('/milestone/:id', db.get.id);

  // Protected routes
  app.post('/milestone', db.post);
  app.put('/milestone/:id', db.put);
  app.delete('/milestone/:id', db.delete);

};
