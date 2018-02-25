/**
 * (C) 2016-2018 printf.jp
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
    static async add(model : Session) : Promise<Session>
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'add');
        const collection = SessionCollection.collection();
        await collection.insert(model);
        log.stepOut();
        return model;
    }

    /**
     * セッションを更新する
     *
     * @param   model   セッション
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static async update(model : Session, cond : SessionFindCondition) : Promise<void>
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'update');
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
    }

    /**
     * セッションを検索する
     *
     * @param   sessionId   セッションID
     *
     * @return  Session。該当するセッションを返す
     */
    static async find(sessionId : string) : Promise<any>
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'find');
        const filter : Session = {id:sessionId};

        const collection = SessionCollection.collection();
        const results = await collection.find(filter);

        log.stepOut();
        return results;
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
