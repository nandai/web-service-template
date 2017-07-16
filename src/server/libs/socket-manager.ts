/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import SessionAgent from 'server/agents/session-agent';
import {slog}       from './slog';

import _ =        require('lodash');
import socketIO = require('socket.io');

/**
 * クライアント
 */
interface Client
{
    sessionId : string;
    accountId : number;
}

/**
 * ソケットマネージャー
 */
export default class SocketManager
{
    private static CLS_NAME = 'SocketManager';
    private static clients      : {[socketId  : string] : Client} = {};
    private static sessionRooms : {[sessionId : string] : SocketIO.Socket[]} = {};
    private static accountRooms : {[accountId : number] : SocketIO.Socket[]} = {};

    /**
     * listen
     */
    static listen(server) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'listen');
        const io = socketIO(server);

        io.on('connect', SocketManager.onConnect);
        log.stepOut();
    }

    private static joinSessionRoom(socket : SocketIO.Socket, sessionId : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'joinSessionRoom');

        if (sessionId)
        {
            const {sessionRooms} = SocketManager;
            const client = SocketManager.clients[socket.id];

            if ((sessionId in sessionRooms) === false) {
                sessionRooms[sessionId] = [];
            }

            sessionRooms[sessionId].push(socket);
            client.sessionId = sessionId;
        }

        log.stepOut();
    }

    private static joinAccountRoom(socket : SocketIO.Socket, accountId : number) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'joinAccountRoom');

        if (accountId)
        {
            const {accountRooms} = SocketManager;
            const client = SocketManager.clients[socket.id];

            if ((accountId in accountRooms) === false) {
                accountRooms[accountId] = [];
            }

            accountRooms[accountId].push(socket);
            client.accountId = accountId;
        }

        log.stepOut();
    }

    private static leaveSessionRoom(socket : SocketIO.Socket) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'leaveSessionRoom');
        const client = SocketManager.clients[socket.id];
        const {sessionId} = client;

        if (sessionId)
        {
            const {sessionRooms} = SocketManager;
            const sessionRoom = sessionRooms[sessionId];

            for (const i in sessionRoom)
            {
                if (sessionRoom[i].id === socket.id)
                {
                    sessionRoom.splice(Number(i), 1);
                    client.sessionId = null;
                    break;
                }
            }

            if (sessionRoom.length === 0)
            {
                log.d(`セッション ${sessionId} のルームが空室になりました。`);
                delete sessionRooms[sessionId];
            }
        }

        log.stepOut();
    }

    private static leaveAccountRoom(socket : SocketIO.Socket) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'leaveAccountRoom');
        const client = SocketManager.clients[socket.id];
        const {accountId} = client;

        if (accountId)
        {
            const {accountRooms} = SocketManager;
            const accountRoom = accountRooms[accountId];

            for (const i in accountRoom)
            {
                if (accountRoom[i].id === socket.id)
                {
                    accountRoom.splice(Number(i), 1);
                    client.accountId = null;
                    break;
                }
            }

            if (accountRoom.length === 0)
            {
                log.d(`アカウント ${accountId} のルームが空室になりました。`);
                delete accountRooms[accountId];
            }
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

            const accountId = session.account_id;
            SocketManager.clients[socket.id] = {sessionId, accountId};
            SocketManager.joinSessionRoom(socket, sessionId);
            SocketManager.joinAccountRoom(socket, accountId);

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

        SocketManager.leaveSessionRoom(socket);
        SocketManager.leaveAccountRoom(socket);

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
        const {sessionRooms, accountRooms} = SocketManager;
        const sessionRoom = sessionRooms[sessionId];

        for (const i in sessionRoom)
        {
            const socket = sessionRoom[i];
            SocketManager.joinAccountRoom(socket, accountId);
        }
    }

    /**
     * アカウント更新通知
     */
    static notifyUpdateAccount(accountId : number, account : Response.Account) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateAccount');
        const {accountRooms} = SocketManager;
        const accountRoom = accountRooms[accountId];

        log.d(`送信数: ${accountRoom.length}`);
        accountRoom.forEach((socket) => socket.emit('notifyUpdateAccount', account));

        log.stepOut();
    }

    /**
     * ユーザー更新通知
     */
    static notifyUpdateUser(user : Response.User) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateUser');
        const {sessionRooms} = SocketManager;

        for (const key in sessionRooms)
        {
            const sessionRoom = sessionRooms[key];

            log.d(`送信数: ${sessionRoom.length}`);
            sessionRoom.forEach((socket) => socket.emit('notifyUpdateUser', user));
        }

        log.stepOut();
    }

    /**
     * ログアウト通知
     */
    static notifyLogout(cond : {sessionId? : string, accountId? : number}) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyLogout');

        if (cond.sessionId)
        {
            const {sessionRooms} = SocketManager;
            const sessionRoom = sessionRooms[cond.sessionId];
            log.d(`送信数: ${sessionRoom.length}`);

            sessionRoom.forEach((socket) => socket.emit('notifyLogout'));

            const sockets = _.clone(sessionRoom);
            sockets.forEach((socket) =>
            {
                SocketManager.leaveAccountRoom(socket);
            });
        }

        if (cond.accountId)
        {
            const {accountRooms} = SocketManager;
            const accountRoom = accountRooms[cond.accountId];
            log.d(`送信数: ${accountRoom.length}`);

            accountRoom.forEach((socket) => socket.emit('notifyLogout'));

            const sockets = _.clone(accountRoom);
            sockets.forEach((socket) =>
            {
                SocketManager.leaveAccountRoom(socket);
            });
        }

        log.stepOut();
    }
}
