/**
 * (C) 2016-2018 printf.jp
 */
import {slog}    from 'libs/slog';
import {Account} from 'server/models/account';
import DB        from '.';

/**
 * 削除アカウントモデル
 */
export default class DeleteAccountCollection
{
    private static CLS_NAME = 'DeleteAccountCollection';

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     */
    static async add(model : Account) : Promise<Account>
    {
        const log = slog.stepIn(DeleteAccountCollection.CLS_NAME, 'add');
        const sql = 'INSERT INTO delete_account SET ?';
        const values = model;
        await DB.query(sql, values);
        log.stepOut();
        return model;
    }
}
