import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const ChatRoom = sequelize.define(
  'ChatRoom',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('direct', 'group', 'incident'),
      defaultValue: 'group'
    },
    scope: {
      type: DataTypes.STRING(80),
      defaultValue: 'operations'
    },
    participantRoles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['victim', 'helper', 'authority', 'admin']
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'chat_rooms',
    underscored: true
  }
);
