
import { io, Socket } from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // Backend URL
const socket: Socket = io(ENDPOINT, { transports: ["websocket"] });

export default socket;
