'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { primaryKey: true, type: Sequelize.STRING },
      address: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.addConstraint('Users', {
      type: 'unique',
      fields: ['address'],
      name: 'Users_unique_address',
    })
  },

  async down (queryInterface) {
    await queryInterface.removeConstraint('Users', 'Users_unique_address')
    await queryInterface.dropTable('Users')
  },
}
