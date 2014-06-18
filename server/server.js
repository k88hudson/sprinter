module.exports = function (env) {
  var express = require('express');
  var app = express();
  var db = require('./db')(env.get('db'));
  var bz = require('bz');
  var request = require('request');

  // Autha
  var oauth2 = require('simple-oauth2')({
    clientID: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    site: 'https://github.com/login',
    tokenPath: '/oauth/access_token'
  });
  var redirectUri = env.get('AUDIENCE') + '/auth/callback';
  var authUri = oauth2.AuthCode.authorizeURL({
    redirect_uri: redirectUri,
    scope: 'user:email',
    state: '3(#0/!~'
  });

  app.use(express.logger('dev'));
  app.use(express.compress());

  app.use(express.json());
  app.use(express.urlencoded());

  // Session
  app.use(express.cookieParser());
  app.use(express.cookieSession({
    secret: 'secret'
  }));
  app.use(express.csrf());

  // Static files
  app.use(express.static('./app'));

  // Auth routes

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
      //req.session.token = oauth2.AccessToken.create(result);
      console.log(data);
      req.session.token = data.access_token;
      res.redirect('/test');
    }
  });

  function github(url, token, cb) {
    request.get({
      url: 'https://api.github.com/' + url,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'Sprinter'
      }
    }, function(err, resp, body) {
      cb(err, body && JSON.parse(body));
    });
  }


  // REMOVE
  app.get('/test', function(req, res) {
    console.log(req.session.token);
    request.get({
      url: 'https://api.github.com/user',
      headers: {
        'Authorization': 'token ' + req.session.token,
        'User-Agent': 'Sprinter'
      }
    }, function(err, response, body) {
      res.send(JSON.parse(body));
    });
  });

  app.get('/user', function(req, res) {
    request.get({
      url: 'https://api.github.com/user',
      headers: {
        'Authorization': 'token ' + req.session.token,
        'User-Agent': 'Sprinter'
      }
    }, function(err, response, body) {
      res.send(JSON.parse(body));
    });
  });

  app.get('/github/:details', function(req, res) {
    var url = 'repos/' + req.query.repo + '/' + req.params.details;
    github(url, req.session.token, function(err, data) {
      if (err) {
        return next(err);
      }
      res.send(data);
    });
  });

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    var config = env.get('ANGULAR');

    config.csrf = req.csrfToken();

    res.type('js');
    res.send('window.angularConfig = ' + JSON.stringify(config) + ';');
  });

  require('./routes')(env, app, db);


  // bz
  var bugzilla = env.get('OFFLINE') ? require('../offline/bz.js') : bz.createClient();
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
      'o1': 'equals'
    }, function (err, bugs) {
      if (err) {
        return next(err);
      }
      var flags = [];
      bugs.forEach(function (bug) {
        bug.flags.forEach(function (flag) {
          flag.bug = JSON.parse(JSON.stringify(bug));
          flags.push(flag);
        })
      });
      return res.send(flags);
    });
  });

  //Errors
  app.use(function errorHandler (err, req, res, next) {
    if (!err) {
      return next();
    }
    // Log
    console.log(err.stack || err);

    if (err.statusCode === 401) {
      delete req.session;
    }

    res.send(500, {
      error: err.message
    });

  });

  return app;
};
