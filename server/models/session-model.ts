/**
 * (C) 2016 printf.jp
 */
import SeqModel from './seq-model';
import Utils    from '../libs/utils';

import fs =     require('fs');
import __ =     require('lodash');
import uuid =   require('node-uuid');
import moment = require('moment');
import slog =   require('../slog');
const co =      require('co');

/**
 * セッション
 */
export class Session
{
    pk         : number = null;
    id         : string = null;
    account_id : number = null;
    message_id : string = null;
    created_at : string = null;

    /**
     * リフレッシュ
     */
    refresh() : void
    {
        this.id = uuid.v4();
    }
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
            SessionModel.list = [];

            fs.statSync(SessionModel.path);
            const text = fs.readFileSync(SessionModel.path, 'utf8');
            const list = JSON.parse(text);

            for (const obj of list)
            {
                const session = new Session();
                Utils.copy(session, obj);
                SessionModel.list.push(session);
            }
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

            session.pk = SeqModel.next('session');
            session.id = uuid.v4();
            session.created_at = m.format('YYYY/MM/DD HH:mm:ss');
            SessionModel.list.push(session);
            SessionModel.save();

            log.stepOut();
            resolve();
        });
    }

    /**
     * セッションを更新する
     *
     * @param   session セッション
     *
     * @return  なし
     */
    static update(session : Session) : Promise<any>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'update');
        return new Promise((resolve, reject) =>
        {
            for (let i in SessionModel.list)
            {
                if (SessionModel.list[i].pk === session.pk)
                {
                    __.extend(SessionModel.list[i], session);
                    SessionModel.save();
                    log.d('更新しました。');
                    break;
                }
            }

            log.stepOut();
            resolve();
        });
    }

    /**
     * ログアウトする
     *
     * @param   cond    検索条件
     *
     * @return  なし
     */
    static logout(cond : SessionFindCondition) : Promise<any>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'logout');
        log.d(JSON.stringify(cond, null, 2));

        return new Promise((resolve, reject) =>
        {
            for (const session of SessionModel.list)
            {
                if ((cond.sessionId === undefined || session.id         === cond.sessionId)
                &&  (cond.accountId === undefined || session.account_id === cond.accountId))
                {
                    session.account_id = null;
                    log.d('ログアウトしました。');
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
