var Sequelize = require('sequelize');

module.exports = function(options) {

  options = options || {};

  var sequelize;

  // MySQL with settings
  if (options.dialect == 'mysql' && options.database) {
    sequelize = new Sequelize(options.database, options.user, options.password, {
      logging: console.log,
      host: options.host  || 'localhost',
      port: options.port || 3306,
      dialectOptions: {
        'SSL_VERIFY_SERVER_CERT': options.cert
      }
    });

  // MySQL with connection string
  } else if (options.connectionstring) {
    sequelize = new Sequelize(options.connectionstring);

  // Sqlite (Default)
  } else {
    sequelize = new Sequelize(options.database, options.user, options.password, {
      dialect: 'sqlite',
      storage: options.storage || 'sprinter.sqlite'
    });
  }

  // Import models
  var Team = sequelize.import(__dirname + '/team.js');
  var Sprint = sequelize.import(__dirname + '/sprint.js');

  // Associations
  Team.hasMany(Sprint);

  // Sync
  sequelize.sync().complete(function (err) {
    if (err) {
      console.log(err.stack);
    } else {
      console.log('Successfully synced.')
    }
  });

  // Export models
  return {
    sprint: Sprint,
    team: Team
  };

};
