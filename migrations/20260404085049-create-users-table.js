"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      houseNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      showFullAddress: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: Sequelize.ENUM("user", "vendor"),
        allowNull: false,
        defaultValue: "user",
      },
      profilePicture: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      faceCaptureVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      faceCaptureImage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cacRegNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      subscriptionType: {
        type: Sequelize.ENUM("free", "basic", "premium"),
        defaultValue: "free",
      },
      subscriptionExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      socialTiktok: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      socialInstagram: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      socialFacebook: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      socialLinkedin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      socialWebsite: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastBusinessNameChange: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("users");
  },
};
