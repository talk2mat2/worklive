"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("users");

    const addIfMissing = async (col, definition) => {
      if (!tableDesc[col]) {
        await queryInterface.addColumn("users", col, definition);
      }
    };

    await addIfMissing("street", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("showFullAddress", { type: Sequelize.BOOLEAN, defaultValue: false });
    await addIfMissing("type", {
      type: Sequelize.ENUM("user", "vendor"),
      allowNull: false,
      defaultValue: "user",
    });
    await addIfMissing("faceCaptureVerified", { type: Sequelize.BOOLEAN, defaultValue: false });
    await addIfMissing("faceCaptureImage", { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing("businessName", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("category", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("description", { type: Sequelize.TEXT, allowNull: true });
    await addIfMissing("cacRegNo", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("isVerified", { type: Sequelize.BOOLEAN, defaultValue: false });
    await addIfMissing("subscriptionType", {
      type: Sequelize.ENUM("free", "basic", "premium"),
      defaultValue: "free",
    });
    await addIfMissing("subscriptionExpiresAt", { type: Sequelize.DATE, allowNull: true });
    await addIfMissing("socialTiktok", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("socialInstagram", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("socialFacebook", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("socialLinkedin", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("socialWebsite", { type: Sequelize.STRING, allowNull: true });
    await addIfMissing("lastBusinessNameChange", { type: Sequelize.DATE, allowNull: true });

    // Widen profilePicture from VARCHAR to TEXT for base64 support
    if (tableDesc["profilePicture"]) {
      await queryInterface.changeColumn("users", "profilePicture", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const cols = [
      "street", "showFullAddress", "type", "faceCaptureVerified", "faceCaptureImage",
      "businessName", "category", "description", "cacRegNo", "isVerified",
      "subscriptionType", "subscriptionExpiresAt", "socialTiktok", "socialInstagram",
      "socialFacebook", "socialLinkedin", "socialWebsite", "lastBusinessNameChange",
    ];
    for (const col of cols) {
      await queryInterface.removeColumn("users", col).catch(() => {});
    }
    await queryInterface.changeColumn("users", "profilePicture", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
