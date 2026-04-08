import { Server } from 'socket.io';
import type { SocketUser } from '../types/index.js';
declare module 'socket.io' {
    interface Socket {
        user?: SocketUser;
    }
}
/**
 * Initialize Socket.IO handlers
 */
export declare const initializeSocket: (io: Server) => void;
//# sourceMappingURL=index.d.ts.map