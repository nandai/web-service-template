/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import SessionAgent from 'server/agents/session-agent';
import {slog}       from './slog';

import socketIO = require('socket.io');

/**
 * クライアント
 */
class Clients
{
    accountId : number = null;
    sockets   : SocketIO.Socket[] = [];

    notifyUpdateAccount(account : Response.Account) : void
    {
        const log = slog.stepIn('Clients', 'notifyUpdateAccount');
        log.d(`ソケット数: ${this.sockets.length}`);

        this.sockets.forEach((socket) =>
        {
            socket.emit('notifyUpdateAccount', account);
        });
        log.stepOut();
    }

    notifyUpdateUser(user : Response.User) : void
    {
        const log = slog.stepIn('Clients', 'notifyUpdateUser');
        log.d(`ソケット数: ${this.sockets.length}`);

        this.sockets.forEach((socket) =>
        {
            socket.emit('notifyUpdateUser', user);
        });
        log.stepOut();
    }

    notifyLogout() : void
    {
        const log = slog.stepIn('Clients', 'notifyLogout');
        log.d(`ソケット数: ${this.sockets.length}`);

        this.accountId = 0;
        this.sockets.forEach((socket) =>
        {
            socket.emit('notifyLogout');
        });

        log.stepOut();
    }

    removeSocket(socket : SocketIO.Socket) : void
    {
        for (const i in this.sockets)
        {
            if (this.sockets[i].id === socket.id)
            {
                this.sockets.splice(Number(i), 1);
                break;
            }
        }
    }

    isEmpty() : boolean
    {
        return (this.sockets.length === 0);
    }
}

/**
 * ソケットマネージャー
 */
export default class SocketManager
{
    private static CLS_NAME = 'SocketManager';
    private static clientsManager : {[sessionId : string] : Clients} = {};

    /**
     * listen
     */
    static listen(server) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'listen');
        const io = socketIO(server);

        io.on('connection', SocketManager.onConnection);
        log.stepOut();
    }

    /**
     * connection event
     */
    private static async onConnection(socket : SocketIO.Socket)
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'onConnection');
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

            const {clientsManager} = SocketManager;
            if ((sessionId in clientsManager) === false) {
                clientsManager[sessionId] = new Clients();
            }

            const clients = clientsManager[sessionId];
            clients.accountId = session.account_id;
            clients.sockets.push(socket);

            socket.on('disconnect', (reason) => {console.log(JSON.stringify(reason, null, 2));SocketManager.onDisconnect(socket, sessionId);});
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
    private static onDisconnect(socket : SocketIO.Socket, sessionId : string) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'onDisconnect');
        log.d('ssessionId:' + sessionId);

        const clients = SocketManager.clientsManager[sessionId];
        clients.removeSocket(socket);

        if (clients.isEmpty())
        {
            log.d(`${sessionId}の接続が完全になくなりました。`);
            delete SocketManager.clientsManager[sessionId];
        }

        log.stepOut();
    }

    /**
     * アカウントIDを設定する
     */
    static setAccountId(sessionId : string, accountId : number)
    {
        const {clientsManager} = SocketManager;
        clientsManager[sessionId].accountId = accountId;
    }

    /**
     * アカウント更新通知
     */
    static notifyUpdateAccount(accountId : number, account : Response.Account) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateAccount');
        const {clientsManager} = SocketManager;

        for (const key in clientsManager)
        {
            const clients = clientsManager[key];

            if (clients.accountId === accountId) {
                clients.notifyUpdateAccount(account);
            }
        }

        log.stepOut();
    }

    /**
     * ユーザー更新通知
     */
    static notifyUpdateUser(user : Response.User) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyUpdateUser');
        const {clientsManager} = SocketManager;

        for (const key in clientsManager)
        {
            const clients = clientsManager[key];
            clients.notifyUpdateUser(user);
        }

        log.stepOut();
    }

    /**
     * ログアウト通知
     */
    static notifyLogout(cond : {sessionId? : string, accountId? : number}) : void
    {
        const log = slog.stepIn(SocketManager.CLS_NAME, 'notifyLogout');
        const {clientsManager} = SocketManager;

        if (cond.sessionId)
        {
            const clients = clientsManager[cond.sessionId];
            clients.notifyLogout();
        }

        if (cond.accountId)
        {
            for (const key in clientsManager)
            {
                const clients = clientsManager[key];

                if (clients.accountId === cond.accountId) {
                    clients.notifyLogout();
                }
            }
        }

        log.stepOut();
    }
}
