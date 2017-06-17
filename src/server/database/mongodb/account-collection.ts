/**
 * (C) 2016-2017 printf.jp
 */
import Config    from 'server/config';
import {Account} from 'server/models/account';
import DB        from '.';

import _ =    require('lodash');
import slog = require('server/slog');

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
    static add(model : Account)
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const newModel = _.clone(model);
                newModel.id = await DB.insertId('account');

                const collection = AccountCollection.collection();
                await collection.insert(newModel);

                log.stepOut();
                resolve(newModel);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * アカウントを更新する
     *
     * @param   model   アカウント
     *
     * @return  なし
     */
    static update(model : Account)
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'update');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const collection = AccountCollection.collection();
                await collection.update({id:model.id}, model);

                log.stepOut();
                resolve();
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * アカウントを削除する
     *
     * @param   accountId   アカウントID
     *
     * @return  なし
     */
    static remove(accountId : number)
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'remove');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const collection = AccountCollection.collection();
                await collection.deleteOne({id:accountId});

                log.stepOut();
                resolve();
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * アカウントを検索する
     *
     * @param   fieldName   検索フィールド名
     * @param   value       検索条件
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByCondition(fieldName : string, value)
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findByCondition');
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
                const filter = {};
                filter[fieldName] = value;

                const collection = AccountCollection.collection();
                const results = await collection.find(filter);

                log.stepOut();
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * Authy IDを検索する
     *
     * @param   international_phone_no  国際電話番号
     * @param   excludeAccountId        検索から除外するアカウントID
     *
     * @return  Authy ID
     */
    static findAuthyId(international_phone_no : string, excludeAccountId? : number)
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findAuthyId');
        return new Promise(async (resolve : (authyId : number) => void, reject) =>
        {
            try
            {
                const filter : Account = {international_phone_no};

                if (excludeAccountId) {
                    filter.id = {$ne:excludeAccountId} as any;
                }

                const collection = AccountCollection.collection();
                const results = await collection.find(filter);
                const authyId = (results.length === 1 ? results[0].authy_id : null);

                log.stepOut();
                resolve(authyId);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * アカウント一覧を検索する
     *
     * @return  Account[]。該当するアカウントの一覧を返す
     */
    static findList(cond : AccountFindListCondition = {})
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findList');
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
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
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
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
