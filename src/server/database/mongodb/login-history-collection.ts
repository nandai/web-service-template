/**
 * (C) 2016-2017 printf.jp
 */
import {slog}         from 'server/libs/slog';
import {LoginHistory} from 'server/models/login-history';
import DB             from '.';

import _ =    require('lodash');

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
                const filter : LoginHistory = {account_id};

                const collection = LoginHistoryCollection.collection();
                const results = await collection.find(filter, {id:-1}, {limit:1, offset:1});

                log.stepOut();
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
