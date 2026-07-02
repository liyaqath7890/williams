import bcrypt from 'bcrypt';
import { Alert, ChatMessage, Resource, Shelter, SosIncident, User, sequelize } from '../models/index.js';
import { ensureDefaultChatRooms } from '../services/chat.service.js';

const users = [
  { name: 'Aegis Victim', email: 'victim@aegis.local', role: 'victim' },
  { name: 'Aegis Helper', email: 'helper@aegis.local', role: 'helper' },
  { name: 'Aegis Authority', email: 'authority@aegis.local', role: 'authority' },
  { name: 'Aegis Admin', email: 'admin@aegis.local', role: 'admin' }
];

try {
  await sequelize.authenticate();

  const passwordHash = await bcrypt.hash('Password123!', 12);
  const createdUsers = {};

  for (const user of users) {
    const [record] = await User.findOrCreate({
      where: { email: user.email },
      defaults: { ...user, passwordHash }
    });
    createdUsers[user.role] = record;
  }

  await Shelter.findOrCreate({
    where: { name: 'Central High School Shelter' },
    defaults: {
      capacity: 220,
      occupancy: 143,
      contactNumber: '+91-90000-10001',
      supplies: [
        { name: 'Food packs', quantity: 680, unit: 'packs' },
        { name: 'Medical kits', quantity: 42, unit: 'kits' }
      ],
      location: { lat: 19.0821, lng: 72.8812, address: 'Central High School, Relief Zone A' },
      status: 'open'
    }
  });

  await Resource.findOrCreate({
    where: { name: 'Emergency water units' },
    defaults: {
      category: 'water',
      quantity: 1240,
      unit: 'litres',
      ownerId: createdUsers.helper.id,
      location: { lat: 19.076, lng: 72.8777, address: 'North depot' },
      status: 'available'
    }
  });

  await Alert.findOrCreate({
    where: { title: 'High rainfall warning' },
    defaults: {
      message: 'Avoid low-lying routes and move toward marked safe zones.',
      severity: 'danger',
      audience: ['victim', 'helper', 'authority', 'admin'],
      region: 'East Bank corridor',
      createdById: createdUsers.authority.id
    }
  });

  await SosIncident.findOrCreate({
    where: { disasterType: 'Flood rescue' },
    defaults: {
      severity: 'critical',
      description: 'Seeded SOS incident for command-center testing.',
      status: 'open',
      location: { lat: 19.0902, lng: 72.8678, address: 'East Bank sector' },
      createdById: createdUsers.victim.id
    }
  });

  const rooms = await ensureDefaultChatRooms();
  const commandRoom = rooms.find((room) => room.name === 'Emergency Command');
  if (commandRoom) {
    await ChatMessage.findOrCreate({
      where: {
        roomId: commandRoom.id,
        senderId: createdUsers.authority.id,
        content: 'Command room initialized. Share verified incident updates here.'
      },
      defaults: {
        kind: 'system'
      }
    });
  }

  console.log('Database seeded.');
  console.log('Demo password for all seeded users: Password123!');
} catch (error) {
  console.error('Database seed failed.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
