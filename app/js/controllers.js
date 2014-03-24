// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('AddCtrl', ['$scope', '$http', 'moment', 'milestoneService',
    function($scope, $http, moment, milestoneService) {

      // The default dueDate should be today

      function reset() {
        $scope.new = {
          dueDate: new Date()
        };
      }

      reset();

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.minDate = new Date();
      $scope.dateOptions = {
         'year-format': "'yy'",
         'show-weeks': false
       };

       $scope.submit = function() {

        // Set the time of the due date to 4:00PM Eastern, which is when our demos are
        $scope.new.dueDate = moment($scope.new.dueDate).hour(16).startOf('hour').toDate();

        $http
          .post('/milestone', $scope.new)
          .success(function(data) {
            reset();
            milestoneService.refresh();
            // how do we notify milestone service?
          });
       };

    }
  ])
  .controller('MilestoneCtrl', ['$scope', '$http', '$rootScope', '$routeParams',

    function($scope, $http, $rootScope, $routeParams) {

      $scope.m = {};

      $http
        .get('/milestone/' + $routeParams.id)
        .success(function(data) {
          $scope.m = data
        });

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

      var asc = '';
      var desc = '-';

      function switchDir(dir) {
        return dir === '-' ? '' : '-';
      }

      $scope.orderField = 'last_change_time';
      $scope.orderDir = desc;

      $scope.setOrderBy = function(field) {
        if (field === $scope.orderField) {
          $scope.orderDir = switchDir($scope.orderDir);
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
            limit: 50
          }
        })
        .success(function(data) {
          console.log(data);
          $scope.bugs = data;
        });

    }
  ]);
