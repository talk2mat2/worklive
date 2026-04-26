"use strict";


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to the users table
    await queryInterface.addColumn("users", "password", {
      type: Sequelize.STRING,
      allowNull: false, // required
    });

    await queryInterface.addColumn("users", "profilePicture", {
      type: Sequelize.STRING,
      allowNull: true, // optional
    });

    await queryInterface.addColumn("users", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the columns if migration is rolled back
    await queryInterface.removeColumn("users", "password");
    await queryInterface.removeColumn("users", "profilePicture");
    await queryInterface.removeColumn("users", "isActive");
  },
};
