import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const SosIncident = sequelize.define(
  'SosIncident',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    disasterType: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'high'
    },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    assignedTeamIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    media: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  },
  {
    tableName: 'sos_incidents',
    underscored: true
  }
);
