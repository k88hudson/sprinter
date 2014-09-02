module.exports = function(env, app, dbInit, bugzilla, authUri) {
  var path = require('path');
  var db = require('./dbController')(dbInit);
  var auth = require('./auth')(env, authUri);
  var bz = require('./bz')(bugzilla);
  var github = require('./github')();

  /*********************************************************
  * Config
  */

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    var config = env.get('ANGULAR');

    config.csrf = req.csrfToken();
    config.ga_id = env.get('GA_ID');
    config.admins = env.get('WHITELIST');
    config.bzProduct = env.get('BZ_PRODUCT');
    config.dev = env.get('DEV');

    res.type('js');
    res.send('window.angularConfig = ' + JSON.stringify(config) + ';');
  });

  /*********************************************************
  * Angular
  */

  var angularRoute = function (req, res) {
    res.sendfile(path.resolve('./app/index.html'));
  };

  // Pages
  app.get('/', angularRoute);
  app.get('/add', angularRoute);
  app.get('/sprint/:id', angularRoute);
  app.get('/sprint/:id/edit', angularRoute);
  app.get('/archived', angularRoute);

  /*********************************************************
  * Auth
  */
  app.get('/auth', auth.login);
  app.get('/auth/callback', auth.callback);
  app.get('/auth/logout', auth.logout);
  app.get('/user', auth.user);

  /*********************************************************
  * Sprinter db
  */
  app.get('/api/sprints', db.get.all);
  app.get('/api/sprint/:id', db.get.id);

  // Protected routes
  app.post('/api/sprint', auth.middleware.whitelistOnly, db.post);
  app.put('/api/sprint/:id', auth.middleware.whitelistOnly, db.put);
  app.delete('/api/sprint/:id', auth.middleware.whitelistOnly, db.delete);

  /*********************************************************
  * Bugzilla
  */
  app.get('/bugs', bz.bugs);
  app.get('/flags', bz.flags);

  /*********************************************************
  * Github
  */
  app.get('/github/:details', github.details);
  app.get('/github/issues/:owner/:repo/milestone/:milestone', github.milestone);

};
