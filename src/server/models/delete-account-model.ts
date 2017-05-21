/**
 * (C) 2016-2017 printf.jp
 */
import Config    from '../config';
import Utils     from '../libs/utils';
import {Account} from './account-model';

import fs =     require('fs');
import moment = require('moment');
import slog =   require('../slog');

/**
 * 削除アカウントモデル
 */
export default class DeleteAccountModel
{
    private static CLS_NAME = 'DeleteAccountModel';
    private static list : Account[] = null;
    private static backupList : Account[] = null;
    private static path = Config.ROOT_DIR + '/storage/delete-account.json';
    private static MESSAGE_UNINITIALIZE = 'DeleteAccountModelが初期化されていません。';

    /**
     * アカウントをJSONファイルからロードする
     */
    static load() : void
    {
        try
        {
            DeleteAccountModel.list = [];

            fs.statSync(DeleteAccountModel.path);
            const text = fs.readFileSync(DeleteAccountModel.path, 'utf8');
            const list = JSON.parse(text);

            for (const obj of list)
            {
                const account = new Account();
                Utils.copy(account, obj);
                DeleteAccountModel.list.push(account);
            }
        }
        catch (err)
        {
            DeleteAccountModel.list = [];
        }
    }

    /**
     * アカウントをJSONファイルにセーブする
     */
    private static save() : void
    {
        const text = JSON.stringify(DeleteAccountModel.list, null, 2);
        fs.writeFileSync(DeleteAccountModel.path, text);
    }

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     *
     * @return  なし
     */
    static add(account : Account)
    {
        const log = slog.stepIn(DeleteAccountModel.CLS_NAME, 'add');
        return new Promise((resolve : () => void, reject) =>
        {
            account.deleted_at = moment().format('YYYY/MM/DD HH:mm:ss');
            DeleteAccountModel.list.push(account);
            DeleteAccountModel.save();

            log.stepOut();
            resolve();
        });
    }
}
