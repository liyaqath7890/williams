import { ChatMessage, ChatRoom, User } from '../models/index.js';

const defaultRooms = [
  {
    name: 'Emergency Command',
    type: 'group',
    scope: 'command',
    participantRoles: ['authority', 'admin', 'helper']
  },
  {
    name: 'Victim Assistance',
    type: 'group',
    scope: 'victim-support',
    participantRoles: ['victim', 'authority', 'admin', 'helper']
  },
  {
    name: 'Volunteer Coordination',
    type: 'group',
    scope: 'field',
    participantRoles: ['helper', 'authority', 'admin']
  }
];

export async function ensureDefaultChatRooms() {
  const rooms = [];
  for (const room of defaultRooms) {
    const [record] = await ChatRoom.findOrCreate({
      where: { name: room.name },
      defaults: room
    });
    rooms.push(record);
  }
  return rooms;
}

export async function listChatRoomsForRole(role) {
  await ensureDefaultChatRooms();
  const rooms = await ChatRoom.findAll({ order: [['createdAt', 'ASC']] });
  return rooms.filter((room) => room.participantRoles.includes(role));
}

export async function listRoomMessages(roomId, limit = 50) {
  return ChatMessage.findAll({
    where: { roomId },
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
    order: [['createdAt', 'ASC']],
    limit
  });
}

export async function createChatMessage({ roomId, senderId, content, kind = 'text', metadata = {} }) {
  const message = await ChatMessage.create({
    roomId,
    senderId,
    content,
    kind,
    metadata
  });

  return ChatMessage.findByPk(message.id, {
    include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }]
  });
}
