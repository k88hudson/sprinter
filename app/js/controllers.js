// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('HomeCtrl', ['$scope', '$http', '$rootScope', '$routeParams',

    function($scope, $http, $rootScope, $routeParams) {

      $scope.m = $rootScope.milestones[$routeParams.id];

      $scope.newBugUrl = 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Webmaker' +
        '&status_whiteboard=' + encodeURIComponent($scope.m.whiteboard);

      $scope.bugs = [];

      $scope.userStories = [
        {
          text: "A user should be able to blah"
        },
        {
          text: "A user should be able to blah blah"
        }
      ];

      $scope.fields = [
        {
          name: 'Updated',
          bz: 'last_change_time'
        },
        {
          name: 'ID',
          bz: 'id'
        },
        {
          name: 'Bug',
          bz: 'summary'
        },
        {
          name: 'Assigned',
          bz: 'assigned_to_detail.real_name'
        },
        {
          name: 'Status',
          bz: 'status'
        }
      ];

      var asc = false;
      var desc = true;

      $scope.orderField = 'last_change_time';
      $scope.orderDir = desc;

      $scope.setOrderBy = function(field) {
        if (field === $scope.orderField) {
          $scope.orderDir = !$scope.orderDir;
        } else {
          $scope.orderField = field;
          if (field === 'last_change_time' || field === 'status') {
            $scope.orderDir = desc;
          } else {
            $scope.orderDir = asc;
          }
        }
      };

      function isResolved(bug) {
        return bug.status === 'RESOLVED';
      }

      $scope.complete = function() {
        return Math.floor($scope.bugs.filter(isResolved).length / $scope.bugs.length * 100);
      };

      $http({
          method: 'GET',
          url: '/bug',
          params: {
            product: 'Webmaker',
            whiteboard: $scope.m.whiteboard,
            limit: 20
          }
        })
        .success(function(data) {
          console.log(data[0]);
          $scope.bugs = data;
        });

    }
  ]);
