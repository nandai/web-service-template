/**
 * (C) 2016-2017 printf.jp
 */
import Utils     from 'server/libs/utils';
import {Session} from 'server/models/session-model';
import DB        from '.';

import _ =    require('lodash');
import slog = require('server/slog');

/**
 * セッションモデル
 */
export default class SessionCollection
{
    private static CLS_NAME = 'SessionCollection';

    private static collection()
    {
        const  collection = DB.collection('session');
        return collection;
    }

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
                const collection = SessionCollection.collection();
                await collection.insert(model);

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
                const filter : Session = {};

                if (cond.sessionId) {
                    filter.id = cond.sessionId;
                }

                if (cond.accountId) {
                    filter.account_id = cond.accountId;
                }

                const collection = SessionCollection.collection();
                await collection.update(filter, {$set:model});

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
                const filter : Session = {id:sessionId};

                const collection = SessionCollection.collection();
                const result = await collection.findOne(filter);

                log.stepOut();
                resolve(result);
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
