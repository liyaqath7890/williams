import { sequelize } from '../config/sequelize.js';
import { Alert } from './Alert.js';
import { ChatMessage } from './ChatMessage.js';
import { ChatRoom } from './ChatRoom.js';
import { MissingPerson } from './MissingPerson.js';
import { Notification } from './Notification.js';
import { Resource } from './Resource.js';
import { Session } from './Session.js';
import { Shelter } from './Shelter.js';
import { SosIncident } from './SosIncident.js';
import { Upload } from './Upload.js';
import { User } from './User.js';

User.hasMany(SosIncident, { foreignKey: 'createdById', as: 'sosIncidents' });
SosIncident.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Alert, { foreignKey: 'createdById', as: 'alerts' });
Alert.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(MissingPerson, { foreignKey: 'reportedById', as: 'missingPersonReports' });
MissingPerson.belongsTo(User, { foreignKey: 'reportedById', as: 'reportedBy' });

User.hasMany(Resource, { foreignKey: 'ownerId', as: 'resources' });
Resource.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Upload, { foreignKey: 'uploadedById', as: 'uploads' });
Upload.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ChatRoom.hasMany(ChatMessage, { foreignKey: 'roomId', as: 'messages' });
ChatMessage.belongsTo(ChatRoom, { foreignKey: 'roomId', as: 'room' });

User.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

export { sequelize, Alert, ChatMessage, ChatRoom, MissingPerson, Notification, Resource, Session, Shelter, SosIncident, Upload, User };
