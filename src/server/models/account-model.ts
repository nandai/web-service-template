/**
 * (C) 2016-2017 printf.jp
 */
import Config from '../config';
import DB     from '../libs/database';
import Utils  from '../libs/utils';

import _ =    require('lodash');
import slog = require('../slog');

/**
 * アカウントモデル
 */
export default class AccountModel
{
    private static CLS_NAME = 'AccountModel';

    /**
     * アカウントを追加する
     *
     * @param   model   アカウント
     */
    static add(model : Account)
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'add');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const sql = 'INSERT INTO account SET ?';
                const values = model;
                const results = await DB.query(sql, values);

                const newModel = _.clone(model);
                newModel.id = results.insertId;

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
        const log = slog.stepIn(AccountModel.CLS_NAME, 'update');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const sql = 'UPDATE account SET ? WHERE id=?';
                const values = [model, model.id];
                const results = await DB.query(sql, values);

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
        const log = slog.stepIn(AccountModel.CLS_NAME, 'remove');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const sql = 'DELETE FROM account WHERE id=?';
                const values = accountId;
                const results = await DB.query(sql, values);

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
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findByCondition');
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
                const sql = 'SELECT * FROM account WHERE ??=?';
                const values = [fieldName, value];
                const results = await DB.query(sql, values);

                log.stepOut();
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * Authy IDを検索する
     *
     * @param   internationalPhoneNo    国際電話番号
     * @param   excludeAccountId        検索から除外するアカウントID
     *
     * @return  Authy ID
     */
    static findAuthyId(internationalPhoneNo : string, excludeAccountId? : number)
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findAuthyId');
        return new Promise(async (resolve : (authyId : number) => void, reject) =>
        {
            try
            {
                let sql = 'SELECT authy_id FROM account WHERE international_phone_no=?';
                const values : any[] = [internationalPhoneNo];

                if (excludeAccountId)
                {
                    sql += ' AND id<>?';
                    values.push(excludeAccountId);
                }

                const results = await DB.query(sql, values);
                const authyId = (results ? results.authy_id : null);

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
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findList');
        return new Promise(async (resolve : (results) => void, reject) =>
        {
            try
            {
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
                resolve(results);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }
}

/**
 * アカウント
 */
export interface Account
{
    id?                     : number;
    name?                   : string;
    user_name?              : string;    // 重複不可
    twitter?                : string;
    facebook?               : string;
    google?                 : string;
    github?                 : string;
    email?                  : string;
    password?               : string;
    country_code?           : string;
    phone_no?               : string;    // 例：03-1234-5678
    international_phone_no? : string;    // 例：81312345678。検索などで使う想定
    authy_id?               : number;
    two_factor_auth?        : string;
    signup_id?              : string;
    invite_id?              : string;
    reset_id?               : string;
    change_id?              : string;
    change_email?           : string;
    crypto_type?            : number;
    created_at?             : string;
    updated_at?             : string;
    deleted_at?             : string;
}

/**
 * アカウント一覧検索条件
 */
interface AccountFindListCondition
{
    registered?           : boolean;
    internationalPhoneNo? : string;
}
