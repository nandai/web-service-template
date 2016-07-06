/**
 * (C) 2016 printf.jp
 */
import fs =     require('fs');
import __ =     require('lodash');
import uuid =   require('node-uuid');
import moment = require('moment');
const co =      require('co');
const slog =    require('../slog');

/**
 * セッション
 */
export class Session
{
    id         : string = null;
    account_id : number = null;
    created_at : string = null;
}

/**
 * セッションモデル
 */
export default class SessionModel
{
    private static CLS_NAME = 'SessionModel';
    private static list: Session[] = null;
    private static path = __dirname + '/../../storage/session.json';
    private static MESSAGE_UNINITIALIZE = 'SessionModelが初期化されていません。';

    /**
     * セッションをJSONファイルからロードする
     */
    static load() : void
    {
        try
        {
            fs.statSync(SessionModel.path);
            const text = fs.readFileSync(SessionModel.path, 'utf8');
            SessionModel.list = JSON.parse(text);
        }
        catch (err)
        {
            SessionModel.list = [];
        }
    }

    /**
     * セッションをJSONファイルにセーブする
     */
    private static save() : void
    {
        const text = JSON.stringify(SessionModel.list, null, 2);
        fs.writeFileSync(SessionModel.path, text);
    }

    /**
     * セッションを追加する
     *
     * @param   session セッション
     *
     * @return  なし
     */
    static add(session : Session) : Promise<any>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'add');
        return new Promise((resolve, reject) =>
        {
            const m = moment();

            session.id = uuid.v4();
            session.created_at = m.format('YYYY/MM/DD HH:mm:ss');
            SessionModel.list.push(session);
            SessionModel.save();

            log.stepOut();
            resolve();
        });
    }

    /**
     * セッションを削除する
     *
     * @param   sessionId   セッションID
     *
     * @return  なし
     */
    static remove(cond : SessionFindCondition) : Promise<any>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'remove');
        log.d(`sessionId:${cond.sessionId}, accountId:${cond.accountId}`);

        return new Promise((resolve, reject) =>
        {
            for (let i = SessionModel.list.length - 1; i >= 0; i--)
            {
                if ((cond.sessionId === undefined || SessionModel.list[i].id         === cond.sessionId)
                &&  (cond.accountId === undefined || SessionModel.list[i].account_id === cond.accountId))
                {
                    SessionModel.list.splice(Number(i), 1);
                    log.d('削除しました。');
                }
            }
            SessionModel.save();

            log.stepOut();
            resolve();
        });
    }

    /**
     * セッションを検索する
     *
     * @param   sessionId   セッションID
     *
     * @return  Session。該当するセッションを返す
     */
    static find(sessionId : string) : Promise<any>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'find');
        log.d(`sessionId:${sessionId}`);

        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                if (SessionModel.isUninitialize())
                {
                    log.stepOut();
                    reject(new Error(SessionModel.MESSAGE_UNINITIALIZE));
                    return;
                }

                for (const session of SessionModel.list)
                {
                    if (session.id === sessionId)
                    {
                        log.d('見つかりました。');
                        const findSession : Session = __.clone(session);

                        log.stepOut();
                        resolve(findSession);
                        return;
                    }
                }

                log.d('見つかりませんでした。');
                log.stepOut();
                resolve(null);
            });
        });
    }

    /**
     * 未初期化かどうか調べる
     *
     * @return  未初期化ならtrueを返す
     */
    private static isUninitialize() : boolean
    {
        return (SessionModel.list === null);
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
