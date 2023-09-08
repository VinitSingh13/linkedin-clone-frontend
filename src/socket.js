import {io} from "socket.io-client";
const ENDPOINT = "https://my-linkedin-clone-backend.onrender.com"

export const socket = io(ENDPOINT);