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
     */
    static associate(models) {
      // define association here
       Pages.belongsTo(models.Chapters, {
        foreignKey: "chapterId",
      });

      Pages.belongsToMany(models.User, {
        through: models.Enroll,
        foreignKey: "pgid",
      });
    }
  }
  Pages.init({
    pgtitle: DataTypes.STRING,
    pgcontent: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Pages',
  });
  return Pages;
};