module.exports = function(sequelize, t) {

  // Team
  // id
  // name
  // description
  // mailingList
  // createdAt
  // updatedAt

  return sequelize.define('Team', {
    name: t.STRING,
    description: t.TEXT,
    mailingList: t.STRING
  });
};
