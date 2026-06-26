"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_requests", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      budgetMin: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      budgetMax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      budgetType: {
        type: Sequelize.ENUM("fixed", "range", "negotiable"),
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      serviceType: {
        type: Sequelize.ENUM("in-person", "remote"),
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("active", "expired", "completed", "cancelled"),
        defaultValue: "active",
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      images: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      offerCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("service_requests");
  },
};
