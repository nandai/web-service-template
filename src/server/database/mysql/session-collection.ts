/**
 * (C) 2016-2017 printf.jp
 */
import {Session} from 'server/models/session';
import DB        from '.';

import _ =    require('lodash');
import slog = require('server/slog');

/**
 * セッションモデル
 */
export default class SessionCollection
{
    private static CLS_NAME = 'SessionCollection';

    /**
     * セッションを追加する
     */
    static add(model : Session)
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Session) => void, reject) =>
        {
            try
            {
                const sql = 'INSERT INTO session SET ?';
                const values = model;
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(model);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * ログアウトする
     *
     * @param   model   セッション
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static update(model : Session, cond : SessionFindCondition)
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'update');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const sql = 'UPDATE session SET ? WHERE ??=?';
                const values : any[] = [model];

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
    static find(sessionId : string)
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'find');
        return new Promise(async (resolve : (model : Session) => void, reject) =>
        {
            try
            {
                const sql = 'SELECT * FROM session WHERE id=?';
                const values = sessionId;
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
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
