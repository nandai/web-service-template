/**
 * (C) 2016-2017 printf.jp
 */
import {Account} from 'server/models/account-model';
import DB        from '.';

import _ =    require('lodash');
import slog = require('server/slog');

/**
 * 削除アカウントモデル
 */
export default class DeleteAccountCollection
{
    private static CLS_NAME = 'DeleteAccountCollection';

    private static collection()
    {
        const  collection = DB.collection('delete_account');
        return collection;
    }

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     */
    static add(model : Account)
    {
        const log = slog.stepIn(DeleteAccountCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const collection = DeleteAccountCollection.collection();
                await collection.insert(model);

                log.stepOut();
                resolve(model);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
