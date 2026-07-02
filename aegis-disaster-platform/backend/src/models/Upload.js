import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const Upload = sequelize.define(
  'Upload',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(600),
      allowNull: false
    },
    publicId: DataTypes.STRING(255),
    storageProvider: {
      type: DataTypes.STRING(40),
      defaultValue: 'cloudinary'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    tableName: 'uploads',
    underscored: true
  }
);
