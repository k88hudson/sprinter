module.exports = function(env, app, dbInit) {

  var db = require('./dbController')(dbInit);

  // Healthcheck
  app.get('/', function(req, res) {
    res.send('Webmaker Events Service is up and running');
  });

  // auth
  // app.all('/oauth/token', app.oauth.grant());
  // app.get('/test', app.oauth.authorise(), function (req, res) {
  //   res.send('Secret area');
  // });


  app.get('/sprint', db.get.all);
  app.get('/sprint/:id', db.get.id);

  // Protected routes
  app.post('/sprint', db.post);
  app.put('/sprint/:id', db.put);
  app.delete('/sprint/:id', db.delete);

};
