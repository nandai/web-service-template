/**
 * (C) 2016-2017 printf.jp
 */
import DB    from '../libs/database';
import Utils from '../libs/utils';

import _ =    require('lodash');
import slog = require('../slog');

/**
 * ログイン履歴
 */
export class LoginHistory
{
    id         : number = null;
    account_id : number = null;
    device     : string = null;
    login_at   : string = null;
}

/**
 * ログイン履歴モデル
 */
export default class LoginHistoryModel
{
    private static CLS_NAME = 'LoginHistoryModel';

    /**
     * ログイン履歴を追加する
     *
     * @param   model    ログイン履歴
     *
     * @return  なし
     */
    static add(model : LoginHistory)
    {
        const log = slog.stepIn(LoginHistoryModel.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : LoginHistory) => void, reject : (err : Error) => void) =>
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
