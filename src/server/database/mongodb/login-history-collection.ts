/**
 * (C) 2016-2017 printf.jp
 */
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

    private static collection()
    {
        const  collection = DB.collection('login_history');
        return collection;
    }

    /**
     * ログイン履歴を追加する
     *
     * @param   model   ログイン履歴
     */
    static add(model : LoginHistory)
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : LoginHistory) => void, reject) =>
        {
            try
            {
                const newModel = _.clone(model);
                newModel.id = await DB.insertId('login_history');

                const collection = LoginHistoryCollection.collection();
                await collection.insert(newModel);

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
