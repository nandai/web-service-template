/**
 * (C) 2016-2018 printf.jp
 */
import {slog}         from 'libs/slog';
import {LoginHistory} from 'server/models/login-history';
import DB             from '.';

import _ = require('lodash');

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
    static async add(model : LoginHistory) : Promise<LoginHistory>
    {
        const log = slog.stepIn(LoginHistoryCollection.CLS_NAME, 'add');
        const newModel = _.clone(model);
        newModel.id = await DB.insertId('login_history');

        const collection = LoginHistoryCollection.collection();
        await collection.insert(newModel);

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
        const filter : LoginHistory = {account_id};

        const collection = LoginHistoryCollection.collection();
        const results = await collection.find(filter, {id:-1}, {limit:1, offset:1});

        log.stepOut();
        return results;
    }
}
