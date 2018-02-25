/**
 * (C) 2016-2018 printf.jp
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
    /**
     * ログイン履歴を追加する
     *
     * @param   model   ログイン履歴
     *
     * @return  なし
     */
    static async add(model : LoginHistory, sessionId : string) : Promise<void>
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
    }

    /**
     * 最終ログイン履歴を取得する
     *
     * @param   account_id  アカウントID
     */
    static async findLatest(account_id : number) : Promise<LoginHistory>
    {
        const data = await collection().findLatest(account_id);
        const model = LoginHistoryAgent.toModel(data);
        return model;
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

        const niu = Utils.nullIfUndefined;
        const model : LoginHistory =
        {
            id:         niu(data.id),
            account_id: niu(data.account_id),
            device:     niu(data.device),
            login_at:   niu(data.login_at)
        };
        return model;
    }
}
