'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('UserSocials', {
      id: { primaryKey: true, type: Sequelize.STRING },
      userId: { type: Sequelize.STRING, allowNull: false },
      platform: { type: Sequelize.STRING, allowNull: false },
      externalId: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.addConstraint('UserSocials', {
      references: {
        table: 'Users',
        field: 'id',
      },
      fields: ['userId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'UserSocials_fkey_userId',
    })
    await queryInterface.addConstraint('UserSocials', {
      type: 'unique',
      fields: ['userId', 'platform', 'externalId'],
      name: 'UserSocials_unique_userId_platform_externalId',
    })
  },

  async down (queryInterface) {
    await queryInterface.removeConstraint('UserSocials', 'UserSocials_unique_userId_platform_externalId')
    await queryInterface.removeConstraint('UserSocials', 'UserSocials_fkey_userId')
    await queryInterface.dropTable('UserSocials')
  },
}
