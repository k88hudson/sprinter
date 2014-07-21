// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('moment', window.moment)
  .factory('sprintService', [
    '$http',
    '$rootScope',
    function($http, $rootScope) {
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
      service.getArchived = function() {
        return $http.get('/api/sprints', {params: {archived: true} });
      };

      return service;
    }
  ]);
