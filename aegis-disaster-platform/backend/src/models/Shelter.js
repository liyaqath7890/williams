import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Shelter = sequelize.define(
  'Shelter',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    occupancy: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    contactNumber: DataTypes.STRING(32),
    supplies: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    location: DataTypes.JSONB,
    status: {
      type: DataTypes.ENUM('open', 'full', 'closed'),
      defaultValue: 'open'
    },
    foodStockDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    medicalStockLevel: {
      type: DataTypes.ENUM('critical', 'low', 'adequate', 'plentiful'),
      defaultValue: 'adequate'
    }
  },
  {
    tableName: 'shelters',
    underscored: true
  }
);
