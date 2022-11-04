'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: { primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      owner: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING(511), allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'created' },
      related: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.createTable('TaskRewards', {
      id: { primaryKey: true, type: Sequelize.STRING },
      taskId: { type: Sequelize.INTEGER, allowNull: false },
      contractAddress: { type: Sequelize.STRING, allowNull: false },
      contractSymbol: { type: Sequelize.STRING, allowNull: false },
      contractDecimals: { type: Sequelize.INTEGER, allowNull: false },
      network: { type: Sequelize.STRING, allowNull: false },
      totalAmount: { type: Sequelize.DECIMAL, allowNull: false },
      rewardAmount: { type: Sequelize.DECIMAL, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.createTable('TaskStatistics', {
      id: { primaryKey: true, type: Sequelize.STRING },
      userId: { type: Sequelize.STRING, allowNull: false },
      taskId: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'not_completed' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.addConstraint('TaskRewards', {
      references: {
        table: 'Tasks',
        field: 'id',
      },
      fields: ['taskId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'TaskRewards_fkey_taskId',
    })
    await queryInterface.addConstraint('TaskStatistics', {
      references: {
        table: 'Tasks',
        field: 'id',
      },
      fields: ['taskId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'TaskStatistics_fkey_taskId',
    })
    await queryInterface.addConstraint('TaskStatistics', {
      references: {
        table: 'Users',
        field: 'id',
      },
      fields: ['userId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'TaskStatistics_fkey_userId',
    })
  },

  async down (queryInterface) {
    await queryInterface.removeConstraint('TaskStatistics', 'TaskStatistics_fkey_userId')
    await queryInterface.removeConstraint('TaskStatistics', 'TaskStatistics_fkey_taskId')
    await queryInterface.removeConstraint('TaskRewards', 'TaskRewards_fkey_taskId')
    await queryInterface.dropTable('TaskStatistics')
    await queryInterface.dropTable('TaskRewards')
    await queryInterface.dropTable('Tasks')
  },
}
