import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    refreshTokenHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: DataTypes.TEXT,
    ipAddress: DataTypes.STRING(80),
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revokedAt: DataTypes.DATE
  },
  {
    tableName: 'sessions',
    underscored: true
  }
);
