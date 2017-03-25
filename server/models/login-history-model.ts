/**
 * (C) 2016-2017 printf.jp
 */
import fs =     require('fs');
import moment = require('moment');
import slog =   require('../slog');

/**
 * ログイン履歴
 */
export class LoginHistory
{
    account_id : number = null;
    device     : string = null;
    login_at   : string = null;
}

/**
 * ログイン履歴モデル
 */
export default class LoginHistoryModel
{
    private static CLS_NAME = 'LoginHistoryModel';
    private static list: LoginHistory[] = null;
    private static path = __dirname + '/../../storage/loginHistory.json';
    private static MESSAGE_UNINITIALIZE = 'LoginHistoryModelが初期化されていません。';

    /**
     * ログイン履歴をJSONファイルからロードする
     */
    static load() : void
    {
        try
        {
            fs.statSync(LoginHistoryModel.path);
            const text = fs.readFileSync(LoginHistoryModel.path, 'utf8');
            LoginHistoryModel.list = JSON.parse(text);
        }
        catch (err)
        {
            LoginHistoryModel.list = [];
        }
    }

    /**
     * ログイン履歴をJSONファイルにセーブする
     */
    private static save() : void
    {
        const text = JSON.stringify(LoginHistoryModel.list, null, 2);
        fs.writeFileSync(LoginHistoryModel.path, text);
    }

    /**
     * ログイン履歴を追加する
     *
     * @param   loginHistory    ログイン履歴
     *
     * @return  なし
     */
    static add(loginHistory : LoginHistory)
    {
        const log = slog.stepIn(LoginHistoryModel.CLS_NAME, 'add');
        return new Promise((resolve : () => void, reject) =>
        {
            const m = moment();

            loginHistory.login_at = m.format('YYYY/MM/DD HH:mm:ss');
            LoginHistoryModel.list.push(loginHistory);
            LoginHistoryModel.save();

            log.stepOut();
            resolve();
        });
    }
}
