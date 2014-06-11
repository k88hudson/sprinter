// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('sidebarCtrl', [
    '$scope',
    'sprintService',
    function ($scope, sprintService) {
      $scope.$watch(function() {
        return sprintService.sprints;
      }, function(newVal) {
        $scope.sprints = newVal;
      });
      sprintService.get();
    }
  ])
  .controller('AddCtrl', ['$scope', '$http', 'moment', 'sprintService',
    function($scope, $http, moment, sprintService) {

      // The default dueDate should be today

      function reset() {
        $scope.new = {
          dueDate: moment().day('Friday').toDate()
        };
      }

      reset();

      $scope.getRepoInfo = function() {
        $http
          .get('/github/milestones', {
            params: {
              repo: $scope.new.repo
            }
          })
          .success(function (data) {
            if (data.length) {
              $scope.repoMilestones = data;
            } else {
              $scope.repoMilestones = [];
            }
            console.log($scope);
          });
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.dateOptions = {
         'year-format': "'yy'",
         'show-weeks': false
       };

       $scope.sprints = sprintService.sprints;

       $scope.submit = function() {

        // Set the time of the due date to 4:00PM Eastern, which is when our demos are
        $scope.new.dueDate = moment($scope.new.dueDate).hour(16).startOf('hour').toDate();

        $http
          .post('/sprint', $scope.new)
          .success(function(data) {
            reset();
            sprintService.get();
          })
          .error(function(err) {
            console.log(err);
          });
       };

       $scope.activeTab = 'bugzilla';

    }
  ])
  .controller('SprintCtrl', ['$scope', '$http', '$rootScope', '$routeParams',

    function($scope, $http, $rootScope, $routeParams) {

      $scope.m = {};

      $scope.archive = function() {
        $http
          .put('/sprint/' + $routeParams.id, {
            archived: true
          })
          .success(function(data) {
            $scope.m = data;
          });
      };

      $http
        .get('/sprint/' + $routeParams.id)
        .success(function(data) {
          $scope.m = data;
          $rootScope.title = data.title;
        });

      $scope.newBugUrl = function() {
        var link = 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Webmaker' +
        '&status_whiteboard=' + encodeURIComponent($scope.m.whiteboard);

        if ($scope.m.defaultComponent) {
          link += ('&component=' + encodeURIComponent($scope.m.defaultComponent));
        }
        return link;
      };

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
          name: 'Whiteboard',
          bz: 'whiteboard',
          class: 'visible-lg'
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
          percentage:  Math.round(bugsResolved / totalBugs * 100),
          resolved: bugsResolved,
          total: totalBugs
        };
      });

     $scope.$watch('m', function() {
       if (!$scope.m.whiteboard) {
         return;
       }
       $http({
           method: 'GET',
           url: '/bug',
           params: {
             product: 'Webmaker',
             whiteboard: $scope.m.whiteboard,
             limit: 200
           }
         })
         .success(function (data) {
           console.log(data);
           $scope.bugs = data;
         });
     });


    }
  ]);
