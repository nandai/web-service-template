/**
 * (C) 2016-2017 printf.jp
 */
import Utils          from 'server/libs/utils';
import {LoginHistory} from 'server/models/login-history-model';
import DB             from '.';

import _ =    require('lodash');
import slog = require('server/slog');

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
}
