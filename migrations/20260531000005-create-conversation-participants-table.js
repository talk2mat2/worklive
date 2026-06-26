"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conversation_participants", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "conversations", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      unreadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("conversation_participants");
  },
};
