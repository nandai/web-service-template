/**
 * (C) 2016-2017 printf.jp
 */
import DB       from '../libs/database';
import Utils    from '../libs/utils';

import _ =      require('lodash');
import uuid =   require('node-uuid');
import slog =   require('../slog');

/**
 * セッション
 */
export class Session
{
    id         : string = null;
    account_id : number = null;
    command_id : string = null;
    message_id : string = null;
    sms_id     : string = null;
    sms_code   : string = null;
    authy_uuid : string = null;
    created_at : string = null;
    updated_at : string = null;
}

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
        return new Promise(async (resolve : SessionResolve, reject : (err : Error) => void) =>
        {
            try
            {
                const newModel = new Session();
                newModel.id = uuid.v4();
                newModel.created_at = Utils.now();

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
        return new Promise(async (resolve : () => void, reject : (err : Error) => void) =>
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

        return new Promise(async (resolve : () => void, reject : (err : Error) => void) =>
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
    static toModel(data : any[]) : Session
    {
        let model : Session = null;
        if (data.length === 1)
        {
            model = new Session();
            Utils.copy(model, data[0]);
        }
        return model;
    }
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
