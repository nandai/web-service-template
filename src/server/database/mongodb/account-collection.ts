/**
 * (C) 2016-2018 printf.jp
 */
import {slog}    from 'libs/slog';
import {Account} from 'server/models/account';
import DB        from '.';

import * as _ from 'lodash';

/**
 * アカウントコレクション
 */
export default class AccountCollection
{
    private static CLS_NAME = 'AccountCollection';

    private static collection()
    {
        const  collection = DB.collection('account');
        return collection;
    }

    /**
     * アカウントを追加する
     *
     * @param   model   アカウント
     */
    static async add(model : Account) : Promise<Account>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'add');
        const newModel = _.clone(model);
        newModel.id = await DB.insertId('account');

        const collection = AccountCollection.collection();
        await collection.insert(newModel);

        log.stepOut();
        return newModel;
    }

    /**
     * アカウントを更新する
     *
     * @param   model   アカウント
     *
     * @return  なし
     */
    static async update(model : Account) : Promise<void>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'update');
        const collection = AccountCollection.collection();
        await collection.update({id:model.id}, model);
        log.stepOut();
    }

    /**
     * アカウントを削除する
     *
     * @param   accountId   アカウントID
     *
     * @return  なし
     */
    static async remove(accountId : number) : Promise<void>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'remove');
        const collection = AccountCollection.collection();
        await collection.deleteOne({id:accountId});
        log.stepOut();
    }

    /**
     * アカウントを検索する
     *
     * @param   fieldName   検索フィールド名
     * @param   value       検索条件
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findByCondition(fieldName : string, value) : Promise<any>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findByCondition');
        const filter = {};
        filter[fieldName] = value;

        const collection = AccountCollection.collection();
        const results = await collection.find(filter);

        log.stepOut();
        return results;
    }

    /**
     * Authy IDを検索する
     *
     * @param   international_phone_no  国際電話番号
     * @param   excludeAccountId        検索から除外するアカウントID
     *
     * @return  Authy ID
     */
    static async findAuthyId(international_phone_no : string, excludeAccountId? : number) : Promise<number>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findAuthyId');
        const filter : Account = {international_phone_no};

        if (excludeAccountId) {
            filter.id = {$ne:excludeAccountId} as any;
        }

        const collection = AccountCollection.collection();
        const results = await collection.find(filter);
        const authyId = (results.length === 1 ? results[0].authy_id : null);

        log.stepOut();
        return authyId;
    }

    /**
     * アカウント一覧を検索する
     *
     * @return  Account[]。該当するアカウントの一覧を返す
     */
    static async findList(cond : AccountFindListCondition = {}) : Promise<any>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findList');
        const filter : Account = {};

        if (cond.registered)
        {
            filter.signup_id = null;
            filter.invite_id = null;
        }

        if (cond.internationalPhoneNo) {
            filter.international_phone_no = cond.internationalPhoneNo;
        }

        const collection = AccountCollection.collection();
        const results = await collection.find(filter);

        log.stepOut();
        return results;
    }
}

/**
 * アカウント一覧検索条件
 */
interface AccountFindListCondition
{
    registered?           : boolean;
    internationalPhoneNo? : string;
}
