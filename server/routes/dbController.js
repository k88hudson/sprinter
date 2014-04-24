module.exports = function(db) {

  return {

    get: {
      all: function(req, res, next) {
        var limit = req.query.limit || 30;
        var order = req.query.order || 'dueDate';

        db.sprint
          .findAll({
            limit: limit,
            order: order
          })
          .success(function(data) {
            res.json(data);
          })
          .error(next);
      },
      id: function(req, res, next) {

        db.sprint
          .find(req.params.id)
          .success(function(data) {
            res.json(data);
          })
          .error(next);

      }
    },

    post: function(req, res, next) {

      // Authentication todo

      db.sprint
        .create(req.body)
        .success(function(data) {
          res.json(data);
        })
        .error(next);
    },

    put: function(req, res, next) {
      var id = req.params.id;
      var updatedAttributes = req.body;

      // First, find the sprint
      db.sprint
        .find(id)
        .success(function(sprintInstance) {

          // Not found
          if (!sprintInstance) {
            return res.send(404, 'No sprint found for id ' + id);
          }

          sprintInstance
            .updateAttributes(updatedAttributes)
            .success(function(data) {
              res.json(data);
            })
            .error(function(err) {
              res.send(500, err);
            });

        })
        .error(next);
    },

    delete: function(req, res, next) {
      var id = req.params.id;

      db.sprint
        .find(id)
        .success(function(sprintInstance) {

          // No event
          if (!sprintInstance) {
            return res.send(404, 'No event found for id ' + id);
          }

          // Authentication
          if (!isAuthorized(req, sprintInstance)) {
            return res.send(403, 'You are not authorized to edit this sprint');
          }

          sprintInstance
            .destroy()
            .success(function(data) {
              res.json(data);
            })
            .error(function(err) {
              res.statusCode = 500;
              res.json(err);
            });
        })
        .error(next);
    }
  };

};
