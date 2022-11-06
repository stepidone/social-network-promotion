'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TwitterGroups', {
      id: { primaryKey: true, type: Sequelize.STRING },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      paginationToken: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.createTable('TwitterFollowers', {
      groupId: { type: Sequelize.STRING, allowNull: false },
      userId: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.createTable('TwitterPosts', {
      id: { primaryKey: true, type: Sequelize.STRING },
      likeStatus: { type: Sequelize.STRING, allowNull: false, defaultValue: 'ignore' },
      retweetStatus: { type: Sequelize.STRING, allowNull: false, defaultValue: 'ignore' },
      likePaginationToken: { type: Sequelize.STRING, allowNull: true },
      retweetPaginationToken: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.createTable('TwitterPostInteractions', {
      type: { type: Sequelize.STRING, allowNull: false },
      postId: { type: Sequelize.STRING, allowNull: false },
      userId: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    })
    await queryInterface.addConstraint('TwitterFollowers', {
      fields: ['groupId', 'userId'],
      type: 'primary key',
      name: 'TwitterFollowers_pkey',
    })
    await queryInterface.addConstraint('TwitterPostInteractions', {
      fields: ['type', 'postId', 'userId'],
      type: 'primary key',
      name: 'TwitterPostInteractions_pkey',
    })
    await queryInterface.addConstraint('TwitterFollowers', {
      references: {
        table: 'TwitterGroups',
        field: 'id',
      },
      fields: ['groupId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'TwitterFollowers_fkey_groupId',
    })
    await queryInterface.addConstraint('TwitterPostInteractions', {
      references: {
        table: 'TwitterPosts',
        field: 'id',
      },
      fields: ['postId'],
      type: 'foreign key',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'TwitterPostInteractions_fkey_postId',
    })
  },

  async down (queryInterface) {
    await queryInterface.removeConstraint('TwitterPostInteractions', 'TwitterPostInteractions_fkey_postId')
    await queryInterface.removeConstraint('TwitterFollowers', 'TwitterFollowers_fkey_groupId')
    await queryInterface.removeConstraint('TwitterPostInteractions', 'TwitterPostInteractions_pkey')
    await queryInterface.removeConstraint('TwitterFollowers', 'TwitterFollowers_pkey')
    await queryInterface.dropTable('TwitterPosts')
    await queryInterface.dropTable('TwitterGroups')
  },
}
