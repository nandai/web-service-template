/**
 * (C) 2016-2017 printf.jp
 */
import DB        from '../database/mysql';
import Utils     from '../libs/utils';
import {Account} from './account-model';

import _ =    require('lodash');
import slog = require('../slog');

/**
 * 削除アカウントモデル
 */
export default class DeleteAccountModel
{
    private static CLS_NAME = 'DeleteAccountModel';

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     *
     * @return  なし
     */
    static add(model : Account)
    {
        const log = slog.stepIn(DeleteAccountModel.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const newModel = _.clone(model);
                newModel.deleted_at = Utils.now();

                const sql = 'INSERT INTO delete_account SET ?';
                const values = newModel;
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
