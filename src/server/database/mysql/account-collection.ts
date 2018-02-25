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

    /**
     * アカウントを追加する
     *
     * @param   model   アカウント
     */
    static async add(model : Account) : Promise<Account>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'add');
        const sql = 'INSERT INTO account SET ?';
        const values = model;
        const results = await DB.query(sql, values);

        const newModel = _.clone(model);
        newModel.id = results.insertId;

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
        const sql = 'UPDATE account SET ? WHERE id=?';
        const values = [model, model.id];
        await DB.query(sql, values);
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
        const sql = 'DELETE FROM account WHERE id=?';
        const values = accountId;
        await DB.query(sql, values);
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
        const sql = 'SELECT * FROM account WHERE ??=?';
        const values = [fieldName, value];
        const results = await DB.query(sql, values);
        log.stepOut();
        return results;
    }

    /**
     * Authy IDを検索する
     *
     * @param   internationalPhoneNo    国際電話番号
     * @param   excludeAccountId        検索から除外するアカウントID
     *
     * @return  Authy ID
     */
    static async findAuthyId(internationalPhoneNo : string, excludeAccountId? : number) : Promise<number>
    {
        const log = slog.stepIn(AccountCollection.CLS_NAME, 'findAuthyId');
        let sql = 'SELECT authy_id FROM account WHERE international_phone_no=?';
        const values : any[] = [internationalPhoneNo];

        if (excludeAccountId)
        {
            sql += ' AND id<>?';
            values.push(excludeAccountId);
        }

        const results = await DB.query(sql, values);
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
        let sql : string;
        let values;

        if (cond.registered) {
            sql = 'SELECT * FROM account WHERE signup_id IS NULL AND invite_id IS NULL';
        }

        if (cond.internationalPhoneNo)
        {
            sql = 'SELECT * FROM account WHERE international_phone_no=?';
            values = cond.internationalPhoneNo;
        }

        const results = await DB.query(sql, values);
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
