/**
 * (C) 2016-2017 printf.jp
 */
import Config   from '../config';
import Utils    from '../libs/utils';
import SeqModel from './seq-model';

import fs =     require('fs');
import __ =     require('lodash');
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
    private static list : Session[] = null;
    private static path = Config.ROOT_DIR + '/storage/session.json';
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
    static add(session : Session)
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'add');
        return new Promise((resolve : () => void, reject) =>
        {
            session.id = uuid.v4();
            session.created_at = Utils.now();
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
    static update(session : Session)
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'update');
        return new Promise((resolve : () => void, reject) =>
        {
            for (const i in SessionModel.list)
            {
                const findSession = SessionModel.list[i];
                if (findSession.id === session.id)
                {
                    __.extend(findSession, session);
                    findSession.updated_at = Utils.now();
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
    static logout(cond : SessionFindCondition)
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'logout');
        log.d(JSON.stringify(cond, null, 2));

        return new Promise((resolve : () => void, reject) =>
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
    static find(sessionId : string) : Promise<Session>
    {
        const log = slog.stepIn(SessionModel.CLS_NAME, 'find');
        log.d(`sessionId:${sessionId}`);

        return new Promise((resolve : SessionResolve, reject) =>
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
                    const findSession = __.clone(session);

                    log.stepOut();
                    resolve(findSession);
                    return;
                }
            }

            log.d('見つかりませんでした。');
            log.stepOut();
            resolve(null);
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

interface SessionResolve {(session : Session) : void;}
