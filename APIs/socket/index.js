import io from "./socketio.js"

const SOCKET_PORT = process.env.SOCKETS_PORT || 3002;

io.listen(SOCKET_PORT)
console.log(`Socket.IO server running on port ${SOCKET_PORT}`)
