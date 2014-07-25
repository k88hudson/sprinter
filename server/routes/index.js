module.exports = function(env, app, dbInit, bugzilla, authUri) {
  var path = require('path');
  var db = require('./dbController')(dbInit);
  var auth = require('./auth')(env, authUri);
  var request = require('request');

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
  app.get('/archived', angularRoute);

  /*********************************************************
  * Auth
  */

  // Initial page redirecting to Github
  app.get('/auth', auth.login);
  app.get('/auth/callback', auth.callback);
  app.get('/auth/logout', auth.logout);
  app.get('/user', auth.user);

  /*********************************************************
  * Bugzilla
  */

  app.get('/bug', function (req, res, next) {
    bugzilla.searchBugs(req.query, function(err, bugs) {
      if (err) {
        return next(err);
      }
      var output = bugs.map(function(bug) {

        // Check real name
        if (!bug.assigned_to_detail.real_name) {
          bug.assigned_to_detail.real_name = bug.assigned_to_detail.email.split('@')[0];
        }
        // Check if bugs which it depends on are resolved
        if (!bug.resolution && bug.depends_on.length) {
          bug.depends_on.forEach(function(blockerId) {
            bugs.forEach(function(item) {
              if (item.id === blockerId && !item.resolution) {
                bug.blocked = true;
              }
            })
          });
        }
        return bug;
      });
      res.send(output);
    })
  });
  app.get('/flags', function (req, res, next) {
    bugzilla.searchBugs({
      'f1': 'requestees.login_name',
      'v1': req.query.user,
      'o1': 'substring'
    }, function (err, bugs) {
      if (err) {
        return next(err);
      }
      var flags = [];
      console.log(bugs);
      bugs.forEach(function (bug) {
        // Reviews don't show up for some reason...
        if (!bug.flags.length) {
          bug.flags.push({
            creation_date: bug.last_change_time,
            requestee: req.query.user,
            setter: 'REVIEW',
            status: '?'
          });
        }
        bug.flags.forEach(function (flag) {
          flag.bug = JSON.parse(JSON.stringify(bug));
          flags.push(flag);
        })
      });
      return res.send(flags);
    });
  });

  /*********************************************************
  * Github
  */

  function github(url, qs, token, cb) {
    request.get({
      url: 'https://api.github.com/' + url,
      qs: qs,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'Sprinter'
      }
    }, function(err, resp, body) {
      cb(err, body && JSON.parse(body));
    });
  }

  app.get('/github/:details', function(req, res) {
    var url = 'repos/' + req.query.repo + '/' + req.params.details;
    github(url, {}, req.session.token, function(err, data) {
      if (err) {
        return next(err);
      }
      res.send(data);
    });
  });

  ///repos/:owner/:repo/issues
  app.get('/github/issues/:owner/:repo/milestone/:milestone', function(req, res) {
    var url = 'repos/' + req.params.owner + '/' + req.params.repo + '/issues';
    github(url, {milestone: req.params.milestone, state: 'all'}, req.session.token, function(err, data) {
      if (err) {
        return next(err);
      }
      res.send(data);
    });
  });


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
  * Sprinter db
  */
  app.get('/api/sprints', db.get.all);
  app.get('/api/sprint/:id', db.get.id);

  // Protected routes
  app.post('/api/sprint', auth.middleware.whitelistOnly, db.post);
  app.put('/api/sprint/:id', auth.middleware.whitelistOnly, db.put);
  app.delete('/api/sprint/:id', auth.middleware.whitelistOnly, db.delete);

};
