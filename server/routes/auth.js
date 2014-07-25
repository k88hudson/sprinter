var request = require('request');

module.exports = function (env, authUri) {
  return {
    // Initial page redirecting to Github
    login: function (req, res) {
      res.redirect(authUri);
    },

    // Callback service parsing the authorization token and asking for the access token
    callback: function (req, res) {
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
      }, function saveToken(err, result, data) {
        if (err) {
          console.log('Access Token Error', error.message);
        } else {
          data = JSON.parse(data);
          req.session.token = data.access_token;
        }
        res.redirect('/');
      });
    },

    // Destroy session
    logout: function (req, res) {
      req.session = {};
      res.send(200);
    },

    user: function (req, res) {
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
    },

    // Auth middleware
    middleware: {
      whitelistOnly: function (req, res, next) {
        var whitelist = env.get('WHITELIST');
        var err;
        if (env.get('DEV')) {
          return next();
        }
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
      }
    }

  }
};
