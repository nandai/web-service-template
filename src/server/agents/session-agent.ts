/**
 * (C) 2016-2018 printf.jp
 */
import {slog}            from 'libs/slog';
import Config            from 'server/config';
import MongoDBCollection from 'server/database/mongodb/session-collection';
import MySQLCollection   from 'server/database/mysql/session-collection';
import SocketManager     from 'server/libs/socket-manager';
import Utils             from 'server/libs/utils';
import {Session}         from 'server/models/session';

import uuid = require('node-uuid');

function collection()
{
    switch (Config.SELECT_DB)
     {
        case 'mongodb': return MongoDBCollection;
        case 'mysql':   return MySQLCollection;
    }
}

/**
 * セッションエージェント
 */
export default class SessionAgent
{
    private static CLS_NAME = 'SessionAgent';

    /**
     * セッションを追加する
     */
    static async add()
    {
        const model : Session =
        {
            id:         uuid.v4(),
            created_at: Utils.now()
        };
        return collection().add(SessionAgent.toModel(model));
    }

    /**
     * セッションを更新する
     *
     * @param   model   セッション
     *
     * @return  なし
     */
    static async update(model : Session)
    {
        const newModel = SessionAgent.toModel(model);
        newModel.updated_at = Utils.now();
        return collection().update(newModel, {sessionId:newModel.id});
    }

    /**
     * ログアウトする
     *
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static async logout(cond : {sessionId? : string, accountId? : number}) : Promise<void>
    {
        const log = slog.stepIn(SessionAgent.CLS_NAME, 'logout');
        const model : Session =
        {
            account_id: null,
            updated_at: Utils.now()
        };
        await collection().update(model, cond);

        // クライアントに通知
        await SocketManager.notifyLogout(cond);
        log.stepOut();
    }

    /**
     * セッションを検索する
     *
     * @param   sessionId   セッションID
     *
     * @return  Session。該当するセッションを返す
     */
    static async find(sessionId : string) : Promise<Session>
    {
        const data = await collection().find(sessionId);
        const model = SessionAgent.toModel(data);
        return model;
    }

    /**
     * ログインしているかどうか
     */
    static isLogin(model : Session) : boolean
    {
        const {account_id, sms_id} = model;

        if (account_id === null) {
            return false;
        }

        if (sms_id !== null) {
            return false;
        }

        return true;
    }

    /**
     * Sessionに変換
     */
    static toModel(data) : Session
    {
        data = Utils.getOne(data);
        return SessionAgent.to_model(data);
    }

    private static to_model(data) : Session
    {
        if (! data) {
            return null;
        }

        const niu = Utils.nullIfUndefined;
        const model : Session =
        {
            id:         niu(data.id),
            account_id: niu(data.account_id),
            command_id: niu(data.command_id),
            message_id: niu(data.message_id),
            sms_id:     niu(data.sms_id),
            sms_code:   niu(data.sms_code),
            authy_uuid: niu(data.authy_uuid),
            created_at: niu(data.created_at),
            updated_at: niu(data.updated_at)
        };
        return model;
    }
}
