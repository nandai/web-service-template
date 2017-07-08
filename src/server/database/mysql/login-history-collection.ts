/**
 * (C) 2016-2017 printf.jp
 */
import {slog}         from 'server/libs/slog';
import {LoginHistory} from 'server/models/login-history';
import DB             from '.';

import _ = require('lodash');

/**
 * ログイン履歴モデル
 */
export default class LoginHistoryCollection
{
    private static CLS_NAME = 'LoginHistoryCollection';

    /**
     * ログイン履歴を追加する
     *
     * @param   model   ログイン履歴
     *
     * @return  なし
     */
    static add(model : LoginHistory)
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : LoginHistory) => void, reject) =>
        {
            try
            {
                const sql = 'INSERT INTO login_history SET ?';
                const values = model;
                const results = await DB.query(sql, values);

                const newModel = _.clone(model);
                newModel.id = results.insertId;

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * 最終ログイン履歴を取得する
     *
     * @param   account_id  アカウントID
     */
    static findLatest(account_id : number)
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'findLatest');
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
                const sql = 'SELECT * FROM login_history WHERE ? ORDER BY id DESC LIMIT 1 OFFSET 1';
                const values = {account_id};
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
