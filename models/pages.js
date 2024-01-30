'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */static associate(models) {
    Pages.belongsTo(models.Chapters, {
        foreignKey: "chId",
      });

      Pages.belongsToMany(models.User, {
        through: models.Enroll,
        foreignKey: "pgId",
      });
   }

  }
  Pages.init({
    pgtitle: DataTypes.STRING,
    pgcontent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pages',
  });
  return Pages;
};