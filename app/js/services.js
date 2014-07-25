// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('moment', window.moment)
  .factory('sprintService', [
    '$http',
    '$rootScope',
    'config',
    function($http, $rootScope, config) {
      var service = {};
      service.sprints = [];
      service.refresh = function() {
        $http
          .get('/api/sprints')
          .success(function(data) {
            service.sprints = data;
            $rootScope.$broadcast('sprintRefresh', service.sprints);
          });
      };
      service.getSprint = function(id) {
        return $http.get('/api/sprint/' + id);
      };
      service.getArchived = function() {
        return $http.get('/api/sprints', {
          params: {
            archived: true,
            limit: 100
          }
        });
      };
      service.newBugUrl = function(whiteboard, defaultComponent) {
        return function() {
          var link = 'https://bugzilla.mozilla.org/enter_bug.cgi?product=' + config.bzProduct +
          '&status_whiteboard=' + encodeURIComponent(whiteboard);

          if (defaultComponent) {
            link += ('&component=' + encodeURIComponent(defaultComponent));
          }
          return link;
        };
      };
      service.archive = function(id, cb) {
        return function() {
          $http
          .put('/api/sprint/' + id, {
            archived: true
          })
          .success(cb);
        };
      };
      return service;
    }
  ])
  .factory('authService', [
    '$http',
    '$rootScope',
    function($http, $rootScope) {
      var service = {};

      // Get the user info and set it to rootscope
      service.getUser = function getUser() {
        $http
          .get('/user')
          .success(function (user) {
            $rootScope.user = user;
          })
          .error(function() {
            $rootScope.user = null;
          });
      };

      // Redirect to oauth login
      service.login = function login() {
        window.location = '/auth';
      };

      // Destroy session, both client and server-side
      service.logout = function logout() {
        $http
          .get('/auth/logout')
          .success(function () {
            $rootScope.user = null;
          });
      };

      return service;
    }
  ]);
