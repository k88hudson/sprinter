var request = require('request');

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

module.exports = function() {
  return {
    details: function(req, res) {
      var url = 'repos/' + req.query.repo + '/' + req.params.details;
      github(url, {}, req.session.token, function (err, data) {
        if (err) {
          return next(err);
        }
        res.send(data);
      });
    },
    milestone: function(req, res) {
      var url = 'repos/' + req.params.owner + '/' + req.params.repo + '/issues';
      github(url, {milestone: req.params.milestone, state: 'all'}, req.session.token, function(err, data) {
        if (err) {
          return next(err);
        }
        res.send(data);
      });
    }
  };
};
