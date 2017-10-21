/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import CommonUtils  from 'libs/utils';
import SessionAgent from 'server/agents/session-agent';
import Config       from 'server/config';

import socketIO = require('socket.io');
import redis =    require('socket.io-redis');

/**
 * クライアント
 */
interface Client
{
    socket    : SocketIO.Socket;
    sessionId : string;
    accountId : number;
}

/**
 * ソケットマネージャー
 */
export default class SocketManager
{
    private static CLS_NAME = 'SocketManager';
    private static io      : SocketIO.Server;
    private static clients : {[socketId  : string] : Client} = {};

    /**
     * listen
     */
    static listen(server) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'listen');
        const io = socketIO(server);
        SocketManager.io = io;

        if (Config.REDIS_URL)
        {
            const arr = Config.REDIS_URL.split(':');
            if (arr.length === 2)
            {
                const opts =
                {
                    host: arr[0],
                    port: Number(arr[1])
                };
                io.adapter(redis(opts));
            }
        }

        io.on('connect', SocketManager.onConnect);
        log.stepOut();
    }

    /**
     * セッションルームに入室
     */
    private static joinSessionRoom(socketId : string, sessionId : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'joinSessionRoom');

        if (sessionId)
        {
            const client = SocketManager.clients[socketId];
            const {socket} = client;

            const room = sessionRoom(sessionId);
            log.d(`${room} に入室しました。`);

            client.sessionId = sessionId;
            socket.join(room);
        }

        log.stepOut();
    }

    /**
     * アカウントルームに入室
     */
    private static joinAccountRoom(socketId : string, accountId : number) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'joinAccountRoom');

        if (accountId)
        {
            const client = SocketManager.clients[socketId];
            const {socket, sessionId} = client;

            const room = accountRoom(accountId);
            log.d(`セッションID ${sessionId} が ${room} に入室しました。`);

            client.accountId = accountId;
            socket.join(room);
        }

        log.stepOut();
    }

    /**
     * セッションルームから退室
     */
    private static leaveSessionRoom(socketId : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'leaveSessionRoom');
        const client = SocketManager.clients[socketId];
        const {socket, sessionId} = client;

        if (sessionId)
        {
            const room = sessionRoom(sessionId);
            log.d(`${room} から退室しました。`);

            socket.leave(room);
            client.sessionId = null;
        }

        log.stepOut();
    }

    /**
     * アカウントルームから退室
     */
    private static leaveAccountRoom(socketId : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'leaveAccountRoom');
        const client = SocketManager.clients[socketId];
        const {socket, sessionId, accountId} = client;

        if (accountId)
        {
            const room = accountRoom(accountId);
            log.d(`セッションID ${sessionId} が ${room} から退室しました。`);

            socket.leave(room);
            client.accountId = null;
        }

        log.stepOut();
    }

    /**
     * connect event
     */
    private static async onConnect(socket : SocketIO.Socket)
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'onConnect');
        let ok = false;

        log.d('socket.id:' + socket.id);
        log.d(JSON.stringify(socket.handshake, null, 2));

        do
        {
            const cookie : string = socket.handshake.headers.cookie;
            const cookies = <{sessionId : string}>CommonUtils.parseRawQueryString(cookie, ';');

            const sessionId = cookies.sessionId;
            if (! sessionId) {
                break;
            }

            const session = await SessionAgent.find(sessionId);
            if (session === null) {
                break;
            }

            const accountId = (SessionAgent.isLogin(session)
                ? session.account_id
                : null);

            SocketManager.clients[socket.id] = {socket, sessionId, accountId};
            SocketManager.joinSessionRoom(socket.id, sessionId);
            SocketManager.joinAccountRoom(socket.id, accountId);

            socket.on('disconnect', (reason) => SocketManager.onDisconnect(socket, reason));
            socket.on('error', (err : Error) => SocketManager.onError(sessionId, err));

            ok = true;
            break;
        }
        while (false);

        if (ok === false)
        {
            log.w('有効なセッションIDがないので切断しました。');
            socket.disconnect();
        }

        log.stepOut();
    }

    /**
     * disconnect event
     */
    private static onDisconnect(socket : SocketIO.Socket, reason : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'onDisconnect');
        log.d(`reason: ${reason}`);

        SocketManager.leaveAccountRoom(socket.id);
        SocketManager.leaveSessionRoom(socket.id);

        delete SocketManager.clients[socket.id];
        log.stepOut();
    }

    /**
     * error event
     */
    private static onError(sessionId : string, err : Error) : void
    {
        console.log('onError');
        console.log(sessionId);
        console.log(err.message);
    }

    /**
     * アカウントIDを設定する
     */
    static setAccountId(sessionId : string, accountId : number)
    {
        return new Promise((resolve : () => void) =>
        {
            const log = slog.stepIn(SocketManager.CLS_NAME, 'setAccountId');
            const room = sessionRoom(sessionId);
            const ns = SocketManager.io.to(room);

            ns.clients((_err, clients : string[]) =>
            {
                clients.forEach((socketId) => SocketManager.joinAccountRoom(socketId, accountId));
                log.stepOut();
                resolve();
            });
        });
    }

    /**
     * アカウント更新通知
     */
    static notifyUpdateAccount(accountId : number, account : Response.Account) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateAccount');
        const room = accountRoom(accountId);
        const ns = SocketManager.io.to(room);

        ns.emit('notifyUpdateAccount', account);
        log.stepOut();
    }

    /**
     * ユーザー更新通知
     */
    static notifyUpdateUser(user : Response.User) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateUser');
        log.d(JSON.stringify(user, null, 2));

        SocketManager.io.emit('notifyUpdateUser', user);
        log.stepOut();
    }

    /**
     * ユーザー削除通知
     */
    static notifyDeleteUser(userId : number) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyDeleteUser');
        SocketManager.io.emit('notifyDeleteUser', userId);
        log.stepOut();
    }

    /**
     * ログアウト通知
     */
    static notifyLogout(cond : {sessionId? : string, accountId? : number})
    {
        return new Promise((resolve : () => void) =>
        {
            const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyLogout');

            let room : string;
            if (cond.sessionId) {room = sessionRoom(cond.sessionId);}
            if (cond.accountId) {room = accountRoom(cond.accountId);}

            let ns = SocketManager.io.to(room);
//          log.d(`送信数: ${ns.adapter.rooms[room].length}`);
            ns.emit('notifyLogout');

            ns = SocketManager.io.to(room);             // emit後のnsを続けて使うとns.clients()のコールバックで
            ns.clients((_err, clients : string[]) =>    // なぜかclientsがおかしな結果になってしまう
            {
                clients.forEach((socketId) => SocketManager.leaveAccountRoom(socketId));
                log.stepOut();
                resolve();
            });
        });
    }
}

function sessionRoom(sessionId : string)
{
    return `session-${sessionId}`;
}

function accountRoom(accountId : number)
{
    return `account-${accountId}`;
}
