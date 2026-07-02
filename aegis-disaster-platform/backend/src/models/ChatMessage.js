import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    kind: {
      type: DataTypes.ENUM('text', 'system'),
      defaultValue: 'text'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'chat_messages',
    underscored: true
  }
);
