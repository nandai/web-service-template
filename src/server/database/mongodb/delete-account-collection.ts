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

    private static collection()
    {
        const  collection = DB.collection('delete_account');
        return collection;
    }

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     */
    static async add(model : Account) : Promise<Account>
    {
        const log = slog.stepIn(DeleteAccountCollection.CLS_NAME, 'add');
        const collection = DeleteAccountCollection.collection();
        await collection.insert(model);
        log.stepOut();
        return model;
    }
}
