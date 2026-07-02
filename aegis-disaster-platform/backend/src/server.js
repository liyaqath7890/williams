import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { registerSocketHandlers } from './sockets/index.js';

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: env.allowAnyOrigin ? true : env.clientOrigin,
    credentials: true
  }
});

registerSocketHandlers(io);

async function bootstrap() {
  await connectDatabase();

  server.listen(env.port, () => {
    console.log(`Aegis API running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start Aegis API', error);
  process.exit(1);
});
