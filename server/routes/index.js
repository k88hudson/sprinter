module.exports = function(env, app, dbInit, bugzilla, authUri) {
  var path = require('path');
  var db = require('./dbController')(dbInit);
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

  /*********************************************************
  * Auth
  */

  // Initial page redirecting to Github
  app.get('/auth', function (req, res) {
    res.redirect(authUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get('/auth/callback', function (req, res) {
    var code = req.query.code;

    request.post({
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        'Accept': 'application/json'
      },
      form: {
        client_id: env.get('GITHUB_CLIENT_ID'),
        client_secret: env.get('GITHUB_CLIENT_SECRET'),
        code: code
      }
    }, saveToken);

    function saveToken(err, result, data) {
      if (err) {
        console.log('Access Token Error', error.message);
      }
      data = JSON.parse(data);
      req.session.token = data.access_token;
      res.redirect('/');
    }
  });

  app.get('/auth/logout', function (req, res) {
    req.session = {};
    res.send(200);
  });

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

  app.get('/user', function(req, res) {
    if (!req.session.token) {
      return res.send(null);
    }
    request.get({
      url: 'https://api.github.com/user',
      headers: {
        'Authorization': 'token ' + req.session.token,
        'User-Agent': 'Sprinter'
      }
    }, function(err, response, body) {
      var user = JSON.parse(body);
      req.session.user = user;
      res.send(user);
    });
  });

  // Auth middleware

  var whitelistOnly = function (req, res, next) {
    var whitelist = env.get('WHITELIST');
    var err;
    if (!req.session.user) {
      err = new Error('Please login through github.');
      err.statusCode = 401;
      return next(err);
    }
    else if (req.session.user.login && whitelist.indexOf(req.session.user.login.toLowerCase()) > -1) {
      return next();
    } else {
      err = new Error('You are not authorized to complete this action. Contact k88hudson to be added to the whitelist');
      err.statusCode = 403;
      return next(err);
    }
  };


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

    res.type('js');
    res.send('window.angularConfig = ' + JSON.stringify(config) + ';');
  });

  /*********************************************************
  * Sprinter db
  */
  app.get('/sprint', db.get.all);
  app.get('/sprint/:id', db.get.id);

  // Protected routes
  app.post('/sprint', whitelistOnly, db.post);
  app.put('/sprint/:id', whitelistOnly, db.put);
  app.delete('/sprint/:id', whitelistOnly, db.delete);

};
