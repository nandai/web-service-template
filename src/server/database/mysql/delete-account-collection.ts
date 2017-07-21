/**
 * (C) 2016-2017 printf.jp
 */
import {slog}    from 'server/libs/slog';
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
    static add(model : Account)
    {
        const log = slog.stepIn(DeleteAccountCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const sql = 'INSERT INTO delete_account SET ?';
                const values = model;
                await DB.query(sql, values);

                log.stepOut();
                resolve(model);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}
