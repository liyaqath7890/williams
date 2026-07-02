import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Alert = sequelize.define(
  'Alert',
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('info', 'warning', 'danger', 'critical'),
      defaultValue: 'warning'
    },
    audience: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    region: DataTypes.STRING(120)
  },
  {
    tableName: 'alerts',
    underscored: true
  }
);
