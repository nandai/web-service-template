/**
 * (C) 2016-2017 printf.jp
 */
import MonboDBCollection from 'server/database/mongodb/session-collection';
import MySQLCollection   from 'server/database/mysql/session-collection';
import Utils             from 'server/libs/utils';
import {Session}         from 'server/models/session';

import uuid = require('node-uuid');

// const Collection = MonboDBCollection;
const Collection = MySQLCollection;

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
        return Collection.add(SessionAgent.toModel(model));
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

        return Collection.update(newModel, {sessionId:newModel.id});
    }

    /**
     * ログアウトする
     *
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static async logout(cond : {sessionId? : string, accountId? : number})
    {
        const model : Session =
        {
            account_id: null,
            updated_at: Utils.now()
        };
        return Collection.update(model, cond);
    }

    /**
     * セッションを検索する
     *
     * @param   sessionId   セッションID
     *
     * @return  Session。該当するセッションを返す
     */
    static find(sessionId : string)
    {
        return new Promise(async (resolve : (model : Session) => void, reject) =>
        {
            try
            {
                const data = await Collection.find(sessionId);
                const model = SessionAgent.toModel(data);

                resolve(model);
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * Sessionに変換
     */
    static toModel(data) : Session
    {
        if (! data) {
            return null;
        }

        if (Array.isArray(data))
        {
            if (data.length !== 1) {
                return null;
            }
            data = data[0];
        }

        return SessionAgent.to_model(data);
    }

    private static to_model(data) : Session
    {
        const model : Session =
        {
            id:         data.id         || null,
            account_id: data.account_id || null,
            command_id: data.command_id || null,
            message_id: data.message_id || null,
            sms_id:     data.sms_id     || null,
            sms_code:   data.sms_code   || null,
            authy_uuid: data.authy_uuid || null,
            created_at: data.created_at || null,
            updated_at: data.updated_at || null
        };
        return model;
    }
}
