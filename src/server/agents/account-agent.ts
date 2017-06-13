/**
 * (C) 2016-2017 printf.jp
 */
import Config            from 'server/config';
import MongoDBCollection from 'server/database/mongodb/account-collection';
import MySQLCollection   from 'server/database/mysql/account-collection';
import Utils             from 'server/libs/utils';
import {Account}         from 'server/models/account';

import slog = require('../slog');

function collection()
{
    switch (Config.SELECT_DB)
     {
        case 'mongodb': return MongoDBCollection;
        case 'mysql':   return MySQLCollection;
    }
}

/**
 * アカウントエージェント
 */
export default class AccountAgent
{
    private static CLS_NAME = 'AccountAgent';

    /**
     * アカウントを追加する
     *
     * @param   model   アカウント
     */
    static add(model : Account)
    {
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                // 追加のデータを設定して、
                const newModel = AccountAgent.toModel(model);
                delete newModel.id;
                newModel.international_phone_no = AccountAgent.international_phone_no(model);
                newModel.crypto_type = 1;
                newModel.created_at = Utils.now();

                // 暗号化して、
                let encryptModel = AccountAgent.toModel(newModel);
                AccountAgent.encrypt(encryptModel);

                // ストレージに追加して、
                encryptModel = await collection().add(encryptModel);

                // 暗号化前のデータにidを設定して、それを返す
                newModel.id = encryptModel.id;
                resolve(newModel);
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * アカウントを更新する
     *
     * @param   model   アカウント
     *
     * @return  なし
     */
    static async update(model : Account)
    {
        // 追加のデータを設定して、
        const newModel = AccountAgent.toModel(model);
        newModel.international_phone_no = AccountAgent.international_phone_no(model);
        newModel.crypto_type = 1;
        newModel.updated_at = Utils.now();

        // 暗号化して、
        AccountAgent.encrypt(newModel);

        // 更新する
        return collection().update(newModel);
    }

    /**
     * アカウントを削除する
     *
     * @param   accountId   アカウントID
     *
     * @return  なし
     */
    static async remove(accountId : number)
    {
        return collection().remove(accountId);
    }

    /**
     * アカウントを検索する
     *
     * @param   fieldName   検索フィールド名
     * @param   value       検索条件
     *
     * @return  Account。該当するアカウントを返す
     */
    private static findByCondition(fieldName : string, value)
    {
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
            {
                const data = await collection().findByCondition(fieldName, value);
                const model = AccountAgent.toModel(data);

                if (model)
                {
                    AccountAgent.decrypt(model);
                    model.international_phone_no = AccountAgent.international_phone_no(model);
                }
                resolve(model);
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * アカウントを検索する
     *
     * @param   accountId   アカウントID
     *
     * @return  Account。該当するアカウントを返す
     */
    static async find(accountId : number)
    {
        return AccountAgent.findByCondition('id', accountId);
    }

    /**
     * アカウントを検索する
     *
     * @param   userName    ユーザー名
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findByUserName(userName : string)
    {
        return AccountAgent.findByCondition('user_name', userName);
    }

    /**
     * アカウントを検索する
     *
     * @param   signupId    サインアップID
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findBySignupId(signupId : string)
    {
        return AccountAgent.findByCondition('signup_id', signupId);
    }

    /**
     * アカウントを検索する
     *
     * @param   inviteId    サインアップID
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findByInviteId(inviteId : string)
    {
        return AccountAgent.findByCondition('invite_id', inviteId);
    }

    /**
     * アカウントを検索する
     *
     * @param   resetId リセットID
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findByResetId(resetId : string)
    {
        return AccountAgent.findByCondition('reset_id', resetId);
    }

    /**
     * アカウントを検索する
     *
     * @param   changeId    変更ID
     *
     * @return  Account。該当するアカウントを返す
     */
    static async findByChangeId(changeId : string)
    {
        return AccountAgent.findByCondition('change_id', changeId);
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
        const log = slog.stepIn(AccountAgent.CLS_NAME, 'findByProviderId');
        return new Promise(async (resolve : (model : Account) => void, reject) =>
        {
            try
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

                    account = await AccountAgent.findByCondition(provider, id);

                    if (account === null && provider === 'email')
                    {
                        // 見つからなければ平文で検索
                        account = await AccountAgent.findByCondition(provider, email);
                    }
                }

                log.stepOut();
                resolve(account);
            }
            catch (err) {reject(err);}
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
    static async findAuthyId(internationalPhoneNo : string, excludeAccountId? : number)
    {
        internationalPhoneNo = Utils.encrypt(internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
        return collection().findAuthyId(internationalPhoneNo, excludeAccountId);
    }

    /**
     * アカウント一覧を検索する
     *
     * @return  Account[]。該当するアカウントの一覧を返す
     */
    static findList(cond : {registered? : boolean, internationalPhoneNo? : string} = {})
    {
        return new Promise(async (resolve : (models : Account[]) => void, reject) =>
        {
            try
            {
                if (cond.internationalPhoneNo) {
                    cond.internationalPhoneNo = Utils.encrypt(cond.internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
                }

                const data = await collection().findList(cond);
                const models = AccountAgent.toModels(data);

                AccountAgent.decrypts(models);
                resolve(models);
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * 暗号化
     */
    static encrypt(model : Account) : void
    {
        model.crypto_type = 1;

        const key = Config.CRYPTO_KEY;
        const iv =  Config.CRYPTO_IV;

        if (model.email)                  {model.email =                  Utils.encrypt(model.email,                  key, iv);}
        if (model.phone_no)               {model.phone_no =               Utils.encrypt(model.phone_no,               key, iv);}
        if (model.international_phone_no) {model.international_phone_no = Utils.encrypt(model.international_phone_no, key, iv);}
        if (model.change_email)           {model.change_email =           Utils.encrypt(model.change_email,           key, iv);}
    }

    /**
     * 復号
     */
    private static decrypt(model : Account) : void
    {
        if (model.crypto_type === 1)
        {
            const key = Config.CRYPTO_KEY;
            const iv =  Config.CRYPTO_IV;

            if (model.email)                  {model.email =                   Utils.decrypt(model.email,                   key, iv);}
            if (model.phone_no)               {model.phone_no =                Utils.decrypt(model.phone_no,                key, iv);}
            if (model.international_phone_no) {model.international_phone_no =  Utils.decrypt(model.international_phone_no,  key, iv);}
            if (model.change_email)           {model.change_email =            Utils.decrypt(model.change_email,            key, iv);}
        }
    }

    private static decrypts(models : Account[]) : void
    {
        models.forEach((model) => AccountAgent.decrypt(model));
    }

    /**
     * 国際電話番号取得
     */
    static internationalPhoneNo(countryCode : string, phoneNo : string) : string
    {
        let internationalPhoneNo = null;

        if (phoneNo && countryCode)
        {
            internationalPhoneNo = phoneNo.replace(/-/g, '');
            internationalPhoneNo = internationalPhoneNo.substr(1);  // 先頭の1文字を取り除く（'0'だったら、ではない）
            internationalPhoneNo = countryCode + internationalPhoneNo;
        }

        return internationalPhoneNo;
    }

    private static international_phone_no(model : Account) : string
    {
        return AccountAgent.internationalPhoneNo(model.country_code, model.phone_no);
    }

    /**
     * 紐づけを解除できるかどうか調べる
     *
     * @param   provider    プロバイダ名
     *
     * @return  解除できる場合はtrueを返す
     */
    static canUnlink(model : Account, provider : string) : boolean
    {
        let count = 0;
        let existsProvider = null;

        if (model.twitter)  {count++; existsProvider = 'twitter';}
        if (model.facebook) {count++; existsProvider = 'facebook';}
        if (model.google)   {count++; existsProvider = 'google';}
        if (model.github)   {count++; existsProvider = 'github';}

        if (model.email && model.password)
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
    static canTwoFactorAuth(model : Account) : boolean
    {
        let possible = false;
        if (model.country_code !== null && model.phone_no !== null)
        {
            switch (model.two_factor_auth)
            {
                case 'SMS':
                    possible = Config.hasTwilio();
                    break;

                case 'Authy':
                    possible = Config.hasAuthy();
                    break;
            }
        }
        return possible;
    }

    /**
     * Accountに変換
     */
    static toModel(data) : Account
    {
        data = Utils.getOne(data);
        return AccountAgent.to_model(data);
    }

    private static toModels(results : any[]) : Account[]
    {
        const  models = results.map((data) => AccountAgent.to_model(data));
        return models;
    }

    private static to_model(data) : Account
    {
        if (! data) {
            return null;
        }

        const model : Account =
        {
            id:                     data.id                     || null,
            name:                   data.name                   || null,
            user_name:              data.user_name              || null,
            twitter:                data.twitter                || null,
            facebook:               data.facebook               || null,
            google:                 data.google                 || null,
            github:                 data.github                 || null,
            email:                  data.email                  || null,
            password:               data.password               || null,
            country_code:           data.country_code           || null,
            phone_no:               data.phone_no               || null,
            international_phone_no: data.international_phone_no || null,
            authy_id:               data.authy_id               || null,
            two_factor_auth:        data.two_factor_auth        || null,
            signup_id:              data.signup_id              || null,
            invite_id:              data.invite_id              || null,
            reset_id:               data.reset_id               || null,
            change_id:              data.change_id              || null,
            change_email:           data.change_email           || null,
            crypto_type:            data.crypto_type            || null,
            created_at:             data.created_at             || null,
            updated_at:             data.updated_at             || null,
            deleted_at:             data.deleted_at             || null
        };
        return model;
    }
}
