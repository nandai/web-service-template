/**
 * (C) 2016-2017 printf.jp
 */
import DB    from '../database/mysql';
import Utils from '../libs/utils';

import _ =    require('lodash');
import slog = require('../slog');

/**
 * ログイン履歴モデル
 */
export default class LoginHistoryModel
{
    private static CLS_NAME = 'LoginHistoryModel';

    /**
     * ログイン履歴を追加する
     *
     * @param   model   ログイン履歴
     *
     * @return  なし
     */
    static add(model : LoginHistory)
    {
        const log = slog.stepIn(LoginHistoryModel.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : LoginHistory) => void, reject) =>
        {
            try
            {
                const newModel = _.clone(model);
                delete newModel.id;
                newModel.login_at = Utils.now();

                const sql = 'INSERT INTO login_history SET ?';
                const values = newModel;
                const results = await DB.query(sql, values);
                newModel.id = results.insertId;

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}

/**
 * ログイン履歴
 */
export interface LoginHistory
{
    id?         : number;
    account_id? : number;
    device?     : string;
    login_at?   : string;
}
