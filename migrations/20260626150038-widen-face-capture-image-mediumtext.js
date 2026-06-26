'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'faceCaptureImage', {
      type: Sequelize.TEXT('medium'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'faceCaptureImage', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
