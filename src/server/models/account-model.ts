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
                const newModel = _.clone(model);
                delete newModel.id;
                newModel.international_phone_no = AccountModel.international_phone_no(model);
                newModel.crypto_type = 1;
                newModel.created_at = Utils.now();

                const encryptModel = _.clone(newModel);
                AccountModel.encrypt(encryptModel);

                const sql = 'INSERT INTO account SET ?';
                const values = encryptModel;
                const results = await DB.query(sql, values);
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
                const newModel = _.clone(model);
                delete newModel.id;
                newModel.international_phone_no = AccountModel.international_phone_no(model);
                newModel.crypto_type = 1;
                newModel.updated_at = Utils.now();
                AccountModel.encrypt(newModel);

                const sql = 'UPDATE account SET ? WHERE id=?';
                const values = [newModel, model.id];
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
        log.d(`accountId:${accountId}`);

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
    private static findByCondition(fieldName : string, value) : Promise<Account>
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findByCondition');
        return new Promise(async (resolve : AccountResolve, reject) =>
        {
            try
            {
                const sql = 'SELECT * FROM account WHERE ??=?';
                const values = [fieldName, value];
                const results = await DB.query(sql, values);
                const model = AccountModel.toModel(results);

                if (model)
                {
                    AccountModel.decrypt(model);
                    model.international_phone_no = AccountModel.international_phone_no(model);
                }

                log.stepOut();
                resolve(model);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * アカウントを検索する
     *
     * @param   accountId   アカウントID
     *
     * @return  Account。該当するアカウントを返す
     */
    static find(accountId : number) : Promise<Account>
    {
        return AccountModel.findByCondition('id', accountId);
    }

    /**
     * アカウントを検索する
     *
     * @param   userName    ユーザー名
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByUserName(userName : string) : Promise<Account>
    {
        return AccountModel.findByCondition('user_name', userName);
    }

    /**
     * アカウントを検索する
     *
     * @param   signupId    サインアップID
     *
     * @return  Account。該当するアカウントを返す
     */
    static findBySignupId(signupId : string) : Promise<Account>
    {
        return AccountModel.findByCondition('signup_id', signupId);
    }

    /**
     * アカウントを検索する
     *
     * @param   inviteId    サインアップID
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByInviteId(inviteId : string) : Promise<Account>
    {
        return AccountModel.findByCondition('invite_id', inviteId);
    }

    /**
     * アカウントを検索する
     *
     * @param   resetId リセットID
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByResetId(resetId : string) : Promise<Account>
    {
        return AccountModel.findByCondition('reset_id', resetId);
    }

    /**
     * アカウントを検索する
     *
     * @param   changeId    変更ID
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByChangeId(changeId : string) : Promise<Account>
    {
        return AccountModel.findByCondition('change_id', changeId);
    }

    /**
     * アカウントを検索する
     *
     * @param   provider    プロバイダ名
     * @param   id          プロバイダ毎のID
     *
     * @return  Account。該当するアカウントを返す
     */
    static findByProviderId(provider : string, id : string)
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findByProviderId');
        log.d(`provider:${provider}, id:${id}`);

        return new Promise(async (resolve : AccountResolve, reject) =>
        {
            let account : Account = null;
            if (id)
            {
                if (provider !== 'twitter'
                &&  provider !== 'facebook'
                &&  provider !== 'google'
                &&  provider !== 'github'
                &&  provider !== 'email')
                {
                    log.e('provider not supported.');
                    log.stepOut();
                    resolve(null);
                    return;
                }

                const email = id;
                if (provider === 'email')
                {
                    // メールアドレスの場合、まずは暗号化してある前提で検索
                    id = Utils.encrypt(id, Config.CRYPTO_KEY, Config.CRYPTO_IV);
                }

                account = await AccountModel.findByCondition(provider, id);

                if (account === null && provider === 'email')
                {
                    // 見つからなければ平文で検索
                    account = await AccountModel.findByCondition(provider, email);
                }
            }

            log.stepOut();
            resolve(account);
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
        const log = slog.stepIn(AccountModel.CLS_NAME, 'getAuthyId');
        return new Promise(async (resolve : (authyId : number) => void, reject) =>
        {
            try
            {
                internationalPhoneNo = Utils.encrypt(internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);

                let sql = 'SELECT * FROM account WHERE international_phone_no=?';
                const values : any[] = [internationalPhoneNo];

                if (excludeAccountId)
                {
                    sql += ' AND id<>?';
                    values.push(excludeAccountId);
                }

                const results = await DB.query(sql, values);
                const model = AccountModel.toModel(results);
                const authyId = (model ? model.authy_id : null);

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
        return new Promise(async (resolve : (accounts : Account[]) => void, reject) =>
        {
            try
            {
                let sql : string;
                let values;

                if (cond.registered) {
                    sql = 'SELECT * FROM account WHERE signup_id IS NULL AND invite_id IS NULL';
                }

                if (cond.internationalPhoneNo) {
                    sql = 'SELECT * FROM account WHERE international_phone_no=?';
                    values = Utils.encrypt(cond.internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
                }

                const results = await DB.query(sql, values);
                const models = AccountModel.toModels(results);

                log.stepOut();
                resolve(models);
            }
            catch (err) {log.stepOut(); reject(err);}
        });
    }

    /**
     * 暗号化
     */
    private static encrypt(account : Account) : void
    {
        account.crypto_type = 1;

        const key = Config.CRYPTO_KEY;
        const iv =  Config.CRYPTO_IV;

        if (account.email)                  {account.email =                  Utils.encrypt(account.email,                  key, iv);}
        if (account.phone_no)               {account.phone_no =               Utils.encrypt(account.phone_no,               key, iv);}
        if (account.international_phone_no) {account.international_phone_no = Utils.encrypt(account.international_phone_no, key, iv);}
        if (account.change_email)           {account.change_email =           Utils.encrypt(account.change_email,           key, iv);}
    }

    /**
     * 復号
     */
    private static decrypt(account : Account) : void
    {
        if (account.crypto_type === 1)
        {
            const key = Config.CRYPTO_KEY;
            const iv =  Config.CRYPTO_IV;

            if (account.email)                  {account.email =                   Utils.decrypt(account.email,                   key, iv);}
            if (account.phone_no)               {account.phone_no =                Utils.decrypt(account.phone_no,                key, iv);}
            if (account.international_phone_no) {account.international_phone_no =  Utils.decrypt(account.international_phone_no,  key, iv);}
            if (account.change_email)           {account.change_email =            Utils.decrypt(account.change_email,            key, iv);}
        }
    }

    /**
     * 国際電話番号取得
     */
    static internationalPhoneNo(countryCode : string, phoneNo : string) : string
    {
        let internationalPhoneNo = null;

        if (phoneNo)
        {
            internationalPhoneNo = phoneNo.replace(/-/g, '');
            internationalPhoneNo = internationalPhoneNo.substr(1);  // 先頭の1文字を取り除く（'0'だったら、ではない）
        }

        if (countryCode) {
            internationalPhoneNo = countryCode + (internationalPhoneNo || '');
        }

        return internationalPhoneNo;
    }

    private static international_phone_no(account : Account) : string
    {
        return AccountModel.internationalPhoneNo(account.country_code, account.phone_no);
    }

    /**
     * Accountに変換
     */
    static toModel(data) : Account
    {
        if (! data) {
            return null;
        }

        if (Array.isArray(data))
        {
            if (data.length !== 1) {
                return null;
            }
            data = data[0];
        }

        return AccountModel.to_model(data);
    }

    private static toModels(results : any[]) : Account[]
    {
        const models = results.map((result) =>
        {
            const model = AccountModel.to_model(result);
            AccountModel.decrypt(model);
            model.international_phone_no = AccountModel.international_phone_no(model);
            return model;
        });
        return models;
    }

    private static to_model(data) : Account
    {
        // const model : Account =
        // {
        //     id:                     data.id,
        //     name:                   data.name,
        //     user_name:              data.user_name,
        //     twitter:                data.twitter,
        //     facebook:               data.facebook,
        //     google:                 data.google,
        //     github:                 data.github,
        //     email:                  data.email,
        //     password:               data.password,
        //     country_code:           data.country_code,
        //     phone_no:               data.phone_no,
        //     international_phone_no: data.international_phone_no,
        //     authy_id:               data.authy_id,
        //     two_factor_auth:        data.two_factor_auth,
        //     signup_id:              data.signup_id,
        //     invite_id:              data.invite_id,
        //     reset_id:               data.reset_id,
        //     change_id:              data.change_id,
        //     change_email:           data.change_email,
        //     crypto_type:            data.crypto_type,
        //     created_at:             data.created_at,
        //     updated_at:             data.updated_at,
        //     deleted_at:             data.deleted_at
        // };
        const model = new Account();
        model.id =                     data.id;
        model.name =                   data.name;
        model.user_name =              data.user_name;
        model.twitter =                data.twitter;
        model.facebook =               data.facebook;
        model.google =                 data.google;
        model.github =                 data.github;
        model.email =                  data.email;
        model.password =               data.password;
        model.country_code =           data.country_code;
        model.phone_no =               data.phone_no;
        model.international_phone_no = data.international_phone_no;
        model.authy_id =               data.authy_id;
        model.two_factor_auth =        data.two_factor_auth;
        model.signup_id =              data.signup_id;
        model.invite_id =              data.invite_id;
        model.reset_id =               data.reset_id;
        model.change_id =              data.change_id;
        model.change_email =           data.change_email;
        model.crypto_type =            data.crypto_type;
        model.created_at =             data.created_at;
        model.updated_at =             data.updated_at;
        model.deleted_at =             data.deleted_at;

        return model;
    }
}

/**
 * アカウント
 */
export class Account
{
    id                     : number = null;
    name                   : string = null;
    user_name              : string = null; // 重複不可
    twitter                : string = null;
    facebook               : string = null;
    google                 : string = null;
    github                 : string = null;
    email                  : string = null;
    password               : string = null;
    country_code           : string = null;
    phone_no               : string = null; // 例：03-1234-5678
    international_phone_no : string = null; // 例：81312345678。検索などで使う想定
    authy_id               : number = null;
    two_factor_auth        : string = null;
    signup_id              : string = null;
    invite_id              : string = null;
    reset_id               : string = null;
    change_id              : string = null;
    change_email           : string = null;
    crypto_type            : number = null;
    created_at             : string = null;
    updated_at             : string = null;
    deleted_at             : string = null;

    /**
     * 紐づけを解除できるかどうか調べる
     *
     * @param   provider    プロバイダ名
     *
     * @return  解除できる場合はtrueを返す
     */
    canUnlink(provider : string) : boolean
    {
        let count = 0;
        let existsProvider = null;

        if (this.twitter)  {count++; existsProvider = 'twitter';}
        if (this.facebook) {count++; existsProvider = 'facebook';}
        if (this.google)   {count++; existsProvider = 'google';}
        if (this.github)   {count++; existsProvider = 'github';}

        if (this.email && this.password)
        {
            count++;
            existsProvider = 'email';
        }

        if (count === 1 && existsProvider === provider) {
            return false;
        }

        return true;
    }

    /**
     * 二段階認証を行えるかどうか
     */
    canTwoFactorAuth() : boolean
    {
        let possible = false;
        if (this.country_code !== null && this.phone_no !== null)
        {
            switch (this.two_factor_auth)
            {
                case 'SMS':
                    possible = Config.hasTwilio();
                    break;

                case 'Authy':
                    possible = (Config.AUTHY_API_KEY !== '');
                    break;
            }
        }
        return possible;
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

interface AccountResolve {(account : Account) : void;}
