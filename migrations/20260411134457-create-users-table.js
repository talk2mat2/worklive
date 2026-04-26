'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn("users", "phoneNumber", {
      type: Sequelize.STRING,
      allowNull: true, // required
    });

      await queryInterface.addColumn("users", "address", {
      type: Sequelize.STRING,
      allowNull: true, // required
    });
      await queryInterface.addColumn("users", "houseNumber", {
      type: Sequelize.STRING,
      allowNull: true, // required
    });
      await queryInterface.addColumn("users", "state", {
      type: Sequelize.STRING,
      allowNull: true, // required
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "phoneNumber");
    await queryInterface.removeColumn("users", "address");
    await queryInterface.removeColumn("users", "houseNumber");
    await queryInterface.removeColumn("users", "state");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
