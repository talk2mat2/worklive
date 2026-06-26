"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("users");
    const addIfMissing = async (col, definition) => {
      if (!tableDesc[col]) await queryInterface.addColumn("users", col, definition);
    };
    await addIfMissing("password", { type: Sequelize.STRING, allowNull: false, defaultValue: "" });
    await addIfMissing("profilePicture", { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing("isActive", { type: Sequelize.BOOLEAN, defaultValue: true });
  },

  async down() {
    // Covered by the base users table migration
  },
};
