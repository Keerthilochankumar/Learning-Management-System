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
     Pages.belongsTo(models.User, {
        foreignKey: "eid",
      });
      // define association here
      Pages.belongsTo(models.Course, {
        foreignKey: "crsid",
      });

      // define association here
      Pages.belongsTo(models.Chapters, {
        foreignKey: "chid",
      });
   }

  }
  Pages.init({
    pgno: DataTypes.INTEGER,
    pgcontent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pages',
  });
  return Pages;
};