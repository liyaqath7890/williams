import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Resource = sequelize.define(
  'Resource',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('food', 'water', 'medical', 'equipment', 'transport', 'vehicle', 'other'),
      defaultValue: 'other'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unit: DataTypes.STRING(40),
    location: DataTypes.JSONB,
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'deployed', 'depleted'),
      defaultValue: 'available'
    },
    assignedTo: DataTypes.STRING(160),
    assignment: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'resources',
    underscored: true
  }
);
