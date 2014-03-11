// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('AddCtrl', ['$scope',
    function($scope) {

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.dt = new Date();
      $scope.minDate = new Date();
      $scope.dateOptions = {
         'year-format': "'yy'",
         'show-weeks': false
       };

    }
  ])
  .controller('HomeCtrl', ['$scope', '$http', '$rootScope', '$routeParams',

    function($scope, $http, $rootScope, $routeParams) {

      $scope.m = $rootScope.milestones[$routeParams.id];

      $scope.newBugUrl = 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Webmaker' +
        '&status_whiteboard=' + encodeURIComponent($scope.m.whiteboard);

      $scope.bugs = [];
      $scope.complete = {};

      $scope.userStories = [
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing",
          bugs: '42432, 23131'
        },
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing"
        },
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing"
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

      $scope.$watch('bugs', function() {
        var bugsResolved = Math.floor($scope.bugs.filter(isResolved).length);
        var totalBugs =  $scope.bugs.length;
        $scope.complete = {
          percentage:  (bugsResolved / totalBugs) * 100,
          resolved: bugsResolved,
          total: totalBugs
        };
      });

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
