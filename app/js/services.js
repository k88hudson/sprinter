// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('moment', window.moment)
  .factory('sprintService', [
    '$http',
    '$rootScope',
    function($http, $rootScope) {
      var service = {};
      service.sprints = [];
      service.get = function() {
        $http
          .get('/sprint')
          .success(function(data) {
            service.sprints = data;
            $rootScope.$broadcast('sprintRefresh', service.sprints);
          });
      };

      return service;
    }
  ]);
