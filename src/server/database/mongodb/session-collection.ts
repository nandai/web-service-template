/**
 * (C) 2016-2017 printf.jp
 */
import {slog}    from 'libs/slog';
import {Session} from 'server/models/session';
import DB        from '.';

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
     * セッションを更新する
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
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
                const filter : Session = {id:sessionId};

                const collection = SessionCollection.collection();
                const results = await collection.find(filter);

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
