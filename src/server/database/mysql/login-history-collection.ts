/**
 * (C) 2016-2017 printf.jp
 */
import {slog}         from 'libs/slog';
import {LoginHistory} from 'server/models/login-history';
import DB             from '.';

import * as _ from 'lodash';

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
    static async add(model : LoginHistory) : Promise<LoginHistory>
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'add');
        const sql = 'INSERT INTO login_history SET ?';
        const values = model;
        const results = await DB.query(sql, values);

        const newModel = _.clone(model);
        newModel.id = results.insertId;

        log.stepOut();
        return newModel;
    }

    /**
     * 最終ログイン履歴を取得する
     *
     * @param   account_id  アカウントID
     */
    static async findLatest(account_id : number) : Promise<any>
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'findLatest');
        const sql = 'SELECT * FROM login_history WHERE ? ORDER BY id DESC LIMIT 1 OFFSET 1';
        const values = {account_id};
        const results = await DB.query(sql, values);
        log.stepOut();
        return results;
    }
}
