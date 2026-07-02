import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const MissingPerson = sequelize.define(
  'MissingPerson',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING(40),
    lastSeenLocation: DataTypes.JSONB,
    description: DataTypes.TEXT,
    photoUrl: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('missing', 'sighted', 'found'),
      defaultValue: 'missing'
    },
    familyContact: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    lastSeenHistory: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    timeline: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    notes: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'missing_persons',
    underscored: true
  }
);
