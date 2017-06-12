/**
 * (C) 2016-2017 printf.jp
 */
import MonboDBCollection from 'server/database/mongodb/login-history-collection';
import MySQLCollection   from 'server/database/mysql/login-history-collection';
import Utils             from 'server/libs/utils';
import {LoginHistory}    from 'server/models/login-history-model';

const Collection = MonboDBCollection;
// const Collection = MySQLCollection;

export default class LoginHistoryAgent
{
    private static CLS_NAME = 'LoginHistoryAgent';

    /**
     * ログイン履歴を追加する
     *
     * @param   model   ログイン履歴
     *
     * @return  なし
     */
    static async add(model : LoginHistory)
    {
        const newModel = LoginHistoryAgent.toModel(model);
        delete newModel.id;
        newModel.login_at = Utils.now();

        return Collection.add(newModel);
    }

    /**
     * Accountに変換
     */
    static toModel(data) : LoginHistory
    {
        if (! data) {
            return null;
        }

        if (Array.isArray(data))
        {
            if (data.length !== 1) {
                return null;
            }
            data = data[0];
        }

        return LoginHistoryAgent.to_model(data);
    }

    private static to_model(data) : LoginHistory
    {
        const model : LoginHistory =
        {
            id:         data.id         || null,
            account_id: data.account_id || null,
            device:     data.device     || null,
            login_at:   data.login_at   || null
        };
        return model;
    }
}
