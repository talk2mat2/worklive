"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("users");
    const addIfMissing = async (col, definition) => {
      if (!tableDesc[col]) await queryInterface.addColumn("users", col, definition);
    };
    await addIfMissing("phoneNumber", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("address", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("houseNumber", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("state", { type: Sequelize.STRING, allowNull: true });
  },

  async down() {
    // Covered by the base users table migration
  },
};
