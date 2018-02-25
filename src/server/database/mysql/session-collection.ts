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

    /**
     * セッションを追加する
     */
    static async add(model : Session) : Promise<Session>
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'add');
        const sql = 'INSERT INTO session SET ?';
        const values = model;
        await DB.query(sql, values);
        log.stepOut();
        return model;
    }

    /**
     * ログアウトする
     *
     * @param   model   セッション
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static async update(model : Session, cond : SessionFindCondition) : Promise<void>
    {
        const log = slog.stepIn(SessionCollection.CLS_NAME, 'update');
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

        await DB.query(sql, values);
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
        const sql = 'SELECT * FROM session WHERE id=?';
        const values = sessionId;
        const results = await DB.query(sql, values);
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
