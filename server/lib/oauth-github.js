var qs = require('querystring');
var request = require('request');

module.exports = function (options) {
  var self = this;

  self.clientID = options.clientID;
  self.clientSecret = options.clientSecret;
  self.baseUrl = options.baseUrl || 'https://github.com/login';
  self.tokenPath = options.tokenPath || '/oauth/access_token';
  self.authorizationPath = options.authorizationPath || '/oauth/authorize';
  self.redirectUri = options.redirectUri;

  self.scope = options.scope || 'user:email';
  self.state = options.state || '';//'3(#0/!~';

  self.authorizationUri = function() {
    return self.baseUrl + self.authorizationPath + '?' + qs.stringify({
      scope: self.scope,
      state: self.state,
      response_type: 'code',
      client_id: self.clientID,
      redirect_uri: self.redirectUri
    });
  };

  self.redirectToProvider = function(req, res) {
    res.redirect(self.authorizationUri());
  };

  self.getToken = function(code, callback) {
    var form = {
      client_id: self.clientID,
      client_secret: self.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    };

    request.post({
      url: self.baseUrl + self.tokenPath,
      headers: {
        'Accept': 'application/json'
      },
      form: form
    }, function(err, resp, data) {
      callback(err, data);
    });
  };
};

