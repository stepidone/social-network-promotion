'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('EventLogs', {
      id: { primaryKey: true, type: Sequelize.STRING },
      network: { type: Sequelize.STRING, allowNull: false },
      returnValues: { type: Sequelize.JSONB, allowNull: true },
      raw: { type: Sequelize.JSONB, allowNull: false },
      event: { type: Sequelize.STRING, allowNull: false },
      signature: { type: Sequelize.STRING, allowNull: false },
      logIndex: { type: Sequelize.INTEGER, allowNull: false },
      transactionIndex: { type: Sequelize.INTEGER, allowNull: false },
      transactionHash: { type: Sequelize.STRING, allowNull: false },
      blockHash: { type: Sequelize.STRING, allowNull: false },
      blockNumber: { type: Sequelize.INTEGER, allowNull: false },
      address: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable('EventLogs')
  },
}
