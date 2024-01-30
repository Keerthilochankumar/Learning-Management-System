'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
   static associate(models) {
      // define association here
      Chapters.belongsTo(models.Course, {
        foreignKey: "csrId",
      });

      Chapters.hasMany(models.Pages, {
        foreignKey: "chId",
      });
   }
    static async remove(id) {
      return this.destroy({
        where: { id, }
    }); 
   }
}
  Chapters.init({
    chdes: DataTypes.STRING,
    chname: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Chapters',
  });
  return Chapters;
};