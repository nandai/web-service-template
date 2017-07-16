/**
 * (C) 2016-2017 printf.jp
 */
import AccountAgent      from 'server/agents/account-agent';
import Config            from 'server/config';
import MongoDBCollection from 'server/database/mongodb/login-history-collection';
import MySQLCollection   from 'server/database/mysql/login-history-collection';
import Converter         from 'server/libs/converter';
import SocketManager     from 'server/libs/socket-manager';
import Utils             from 'server/libs/utils';
import {LoginHistory}    from 'server/models/login-history';

function collection()
{
    switch (Config.SELECT_DB)
     {
        case 'mongodb': return MongoDBCollection;
        case 'mysql':   return MySQLCollection;
    }
}

/**
 * ログイン履歴エージェント
 */
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
    static async add(model : LoginHistory, sessionId : string)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const newModel = LoginHistoryAgent.toModel(model);
                delete newModel.id;
                newModel.login_at = Utils.now();

                await collection().add(newModel);

                // クライアントに通知
                const accountId = newModel.account_id;
                const account = await AccountAgent.find(accountId);

                await SocketManager.setAccountId(sessionId, accountId);
                SocketManager.notifyUpdateAccount(accountId, Converter.accountToResponse(account, newModel));

                resolve();
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * 最終ログイン履歴を取得する
     *
     * @param   account_id  アカウントID
     */
    static findLatest(account_id : number)
    {
        return new Promise(async (resolve : (model : LoginHistory) => void, reject) =>
        {
            try
            {
                const data = await collection().findLatest(account_id);
                const model = LoginHistoryAgent.toModel(data);

                resolve(model);
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * LoginHistoryに変換
     */
    static toModel(data) : LoginHistory
    {
        data = Utils.getOne(data);
        return LoginHistoryAgent.to_model(data);
    }

    private static to_model(data) : LoginHistory
    {
        if (! data) {
            return null;
        }

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
