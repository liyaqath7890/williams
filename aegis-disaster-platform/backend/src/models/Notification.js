import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(60),
      defaultValue: 'info'
    },
    readAt: DataTypes.DATE,
    data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'notifications',
    underscored: true
  }
);
