/**
 * (C) 2016-2017 printf.jp
 */
import DB    from '../libs/database';
import Utils from '../libs/utils';

import _ =    require('lodash');
import uuid = require('node-uuid');
import slog = require('../slog');

/**
 * セッションモデル
 */
export default class SessionModel
{
    private static CLS_NAME = 'SessionModel';

    /**
     * セッションを追加する
     *
     * @param   model   セッション
     *
     * @return  なし
     */
    static add()
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'add');
        return new Promise(async (resolve : SessionResolve, reject) =>
        {
            try
            {
                const newModel : Session =
                {
                    id:         uuid.v4(),
                    created_at: Utils.now()
                };

                const sql = 'INSERT INTO session SET ?';
                const values = newModel;
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * セッションを更新する
     *
     * @param   model   セッション
     *
     * @return  なし
     */
    static update(model : Session)
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'update');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const newModel = _.clone(model);
                delete newModel.id;
                newModel.updated_at = Utils.now();

                const sql = 'UPDATE session SET ? WHERE id=?';
                const values = [newModel, model.id];
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve();
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * ログアウトする
     *
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static logout(cond : SessionFindCondition)
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'logout');
        log.d(JSON.stringify(cond, null, 2));

        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const sql = 'UPDATE session SET ? WHERE ??=?';
                const values : any[] =
                [
                    {
                        account_id: null,
                        updated_at: Utils.now()
                    }
                ];

                if (cond.sessionId)
                {
                    values.push('id');
                    values.push(cond.sessionId);
                }

                if (cond.accountId)
                {
                    values.push('account_id');
                    values.push(cond.accountId);
                }

                const results = await DB.query(sql, values);

                log.stepOut();
                resolve();
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * セッションを検索する
     *
     * @param   sessionId   セッションID
     *
     * @return  Session。該当するセッションを返す
     */
    static find(sessionId : string) : Promise<Session>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'find');
        return new Promise(async (resolve : SessionResolve, reject) =>
        {
            try
            {
                const sql = 'SELECT * FROM session WHERE id=?';
                const values = sessionId;
                const results = await DB.query(sql, values);
                const model = SessionModel.toModel(results);

                log.stepOut();
                resolve(model);
            }
            catch (err) {log.stepOut(); reject(err);}
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

        return SessionModel.to_model(data);
    }

    private static to_model(data) : Session
    {
        const model : Session =
        {
            id:         data.id,
            account_id: data.account_id,
            command_id: data.command_id,
            message_id: data.message_id,
            sms_id:     data.sms_id,
            sms_code:   data.sms_code,
            authy_uuid: data.authy_uuid,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
        return model;
    }
}

/**
 * セッション
 */
export interface Session
{
    id?         : string;
    account_id? : number;
    command_id? : string;
    message_id? : string;
    sms_id?     : string;
    sms_code?   : string;
    authy_uuid? : string;
    created_at? : string;
    updated_at? : string;
}

/**
 * セッション検索条件
 */
export interface SessionFindCondition
{
    sessionId? : string;
    accountId? : number;
}

interface SessionResolve {(model : Session) : void;}
