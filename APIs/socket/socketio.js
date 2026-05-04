import { Server } from "socket.io";
import { createClient } from "redis";
import { createShardedAdapter } from "@socket.io/redis-adapter";

const REDIS_SERVER = process.env.REDIS_SERVER || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;
const SOCKET_PORT = process.env.SOCKETS_PORT || 3002;

// En "redis" v4 se debe pasar como objeto `socket` o como `url`
const pubClient = createClient({
   socket: {
      host: REDIS_SERVER,
      port: REDIS_PORT
   }
});
const subClient = pubClient.duplicate();

const MAX_USERS_PER_ROOM = 6;

await Promise.all([
   pubClient.connect(),
   subClient.connect()
]);

const io = new Server({
   adapter: createShardedAdapter(pubClient, subClient)
});

// Helpers para gestionar el estado en Redis
async function getRoom(roomCode) {
   const data = await pubClient.get(`room:${roomCode}`);
   return data ? JSON.parse(data) : null;
}

async function saveRoom(roomCode, roomData) {
   await pubClient.set(`room:${roomCode}`, JSON.stringify(roomData));
}

async function deleteRoom(roomCode) {
   await pubClient.del(`room:${roomCode}`);
}

io.on('connection', (socket) => {
   const { dbUserId, userName } = socket.handshake.query;

   socket.on('createRoom', async ({ roomCode, user, idBoardGame }) => {
      if (!roomCode || !user || !user.id || !user.userName) {
         socket.emit('createRoomError', { message: 'Datos incompletos para crear la sala.', serverPort: SOCKET_PORT });
         return;
      }

      const existingRoom = await getRoom(roomCode);
      if (existingRoom) {
         socket.emit('createRoomError', { message: 'Este código de sala ya está en uso. Intenta con otro.', serverPort: SOCKET_PORT });
         return;
      }

      const creatorUser = { socketId: socket.id, dbUserId: user.id, userName: user.userName, profileImage: user.profileImage };
      const newRoom = {
         users: [creatorUser],
         creatorSocketId: socket.id,
         maxUsers: MAX_USERS_PER_ROOM,
         nextGuestId: -1,
         idBoard: idBoardGame
      };

      await saveRoom(roomCode, newRoom);
      socket.join(roomCode);
      socket.emit('roomCreated', { roomCode, users: newRoom.users, isCreator: true, serverPort: SOCKET_PORT });
   });

   socket.on('joinRoom', async ({ roomCode, user }) => {
      if (!roomCode || !user) {
         socket.emit('joinError', { message: 'Datos incompletos para unirse a la sala.', serverPort: SOCKET_PORT });
         return;
      }

      const room = await getRoom(roomCode);
      if (!room) {
         socket.emit('joinError', { message: 'La sala no existe.', serverPort: SOCKET_PORT });
         return;
      }
      if (room.users.length >= room.maxUsers) {
         socket.emit('roomFull', { message: 'La sala está llena.', serverPort: SOCKET_PORT });
         return;
      }

      if (user.id < 1) {
         user.id = room.nextGuestId;
         user.userName = `guest${user.id}`;
         room.nextGuestId--;
      }

      if (room.users.some(u => u.dbUserId === user.id)) {
         socket.emit('joinError', { message: 'Ya estás en esta sala.', serverPort: SOCKET_PORT });
         return;
      }

      room.users.push({ socketId: socket.id, dbUserId: user.id, userName: user.userName, profileImage: user.profileImage });
      await saveRoom(roomCode, room);

      socket.join(roomCode);

      socket.emit('joinedRoom', { roomCode, users: room.users, serverPort: SOCKET_PORT });
      io.to(roomCode).emit('groupUpdate', { users: room.users, idBoard: room.idBoard });
   });

   socket.on('setBoard', async ({ roomCode, idBoard }) => {
      const room = await getRoom(roomCode);
      if (room) {
         room.idBoard = idBoard;
         await saveRoom(roomCode, room);
         io.to(roomCode).emit('groupUpdate', { users: room.users, idBoard: room.idBoard });
      }
   });

   socket.on('startGame', async ({ roomCode }) => {
      const room = await getRoom(roomCode);
      if (room && room.creatorSocketId === socket.id) {
         if (room.users.length < 2) {
            socket.emit('startGameError', { message: 'No hay suficientes jugadores para iniciar.', serverPort: SOCKET_PORT });
            return;
         }
         const gameId = `game_${roomCode}_${Date.now()}`;
         room.gameId = gameId;
         await saveRoom(roomCode, room);
         io.to(roomCode).emit('gameStarting', { gameId });
      } else {
         socket.emit('startGameError', { message: 'No autorizado o la sala no existe.', serverPort: SOCKET_PORT });
      }
   });

   // Sustitución de 'disconnect' por 'disconnecting'
   socket.on('disconnecting', async () => {
      console.log(`Usuario desconectando: ${userName} (dbID: ${dbUserId}, socketID: ${socket.id})`);

      // Iterar asíncronamente por las salas a las que pertenecía este socket
      for (const roomCode of socket.rooms) {
         if (roomCode === socket.id) continue; // Ignorar el room generado por su propio ID de socket

         const room = await getRoom(roomCode);
         if (!room) continue;

         const userIndex = room.users.findIndex(u => u.socketId === socket.id);

         if (userIndex !== -1) {
            room.users.splice(userIndex, 1);

            if (room.creatorSocketId === socket.id) {
               socket.to(roomCode).emit('creatorLeft', { message: 'El creador ha abandonado la sala. La sala se cerrará.', serverPort: SOCKET_PORT });

               await deleteRoom(roomCode);
               io.in(roomCode).socketsLeave(roomCode); // Expulsa en todos los contenedores físicos
            } else if (room.users.length === 0) {
               await deleteRoom(roomCode);
            } else {
               await saveRoom(roomCode, room);
               io.to(roomCode).emit('groupUpdate', { users: room.users, idBoard: room.idBoard });
            }
         }
      }
   });

   socket.on('joinBoardGameRoom', async ({ roomCode }) => {
      const room = await getRoom(roomCode);
      if (room) {
         socket.join(roomCode);
      } else {
         socket.emit('errorJoiningGameRoom', { message: 'La sala de juego no existe.', serverPort: SOCKET_PORT });
      }
   });

   socket.on('broadcastGameState', async ({ roomCode, gameState }) => {
      const room = await getRoom(roomCode);
      if (room) {
         room.gameState = gameState;
         await saveRoom(roomCode, room);
         socket.to(roomCode).emit('gameStateUpdated', gameState);
      }
   });

});

export default io;
