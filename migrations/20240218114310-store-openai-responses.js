'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn('Videos', 'sentimentsForVideo', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Videos', 'topVideoRequests', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Videos', 'faqInsideComments', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Videos', 'emotionalTone', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Videos', 'sentimentsForVideo');
    await queryInterface.removeColumn('Videos', 'topVideoRequests');
    await queryInterface.removeColumn('Videos', 'faqInsideComments');
    await queryInterface.removeColumn('Videos', 'emotionalTone');
  },
};
