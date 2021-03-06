/**
 * (C) 2016-2018 printf.jp
 */
import {slog}            from 'libs/slog';
import LoginHistoryAgent from 'server/agents/login-history-agent';
import Config            from 'server/config';
import MongoDBCollection from 'server/database/mongodb/account-collection';
import MySQLCollection   from 'server/database/mysql/account-collection';
import Converter         from 'server/libs/converter';
import SocketManager     from 'server/libs/socket-manager';
import Utils             from 'server/libs/utils';
import {Account}         from 'server/models/account';

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
    static async add(model : Account) : Promise<Account>
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
        const log = slog.stepIn(AccountAgent.CLS_NAME, 'update');

        // 追加のデータを設定して、
        const newModel = AccountAgent.toModel(model);
        newModel.international_phone_no = AccountAgent.international_phone_no(model);
        newModel.crypto_type = 1;
        newModel.updated_at = Utils.now();

        // 暗号化して、
        AccountAgent.encrypt(newModel);

        // 更新する
        await collection().update(newModel);

        // クライアントに通知
        const accountId = newModel.id;
        const loginHistory = await LoginHistoryAgent.findLatest(accountId);
        SocketManager.notifyUpdateAccount(accountId, Converter.accountToResponse(model, loginHistory));

        const user = Converter.accountToUserResponse(model);
        SocketManager.notifyUpdateUser(user);

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
        const log = slog.stepIn(AccountAgent.CLS_NAME, 'logout');
        await collection().remove(accountId);

        // クライアントに通知
        await SocketManager.notifyDeleteUser(accountId);
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
    private static async findByCondition(fieldName : string, value) : Promise<Account>
    {
        let model : Account = null;
        if (value !== null)
        {
            const data = await collection().findByCondition(fieldName, value);
            model = AccountAgent.toModel(data);

            if (model)
            {
                AccountAgent.decrypt(model);
                model.international_phone_no = AccountAgent.international_phone_no(model);
            }
        }
        return model;
    }

    /**
     * アカウントを検索する
     *
     * @param   accountId   アカウントID
     *
     * @return  Account。該当するアカウントを返す
     */
    static find(accountId : number)
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
    static findByUserName(userName : string)
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
    static findBySignupId(signupId : string)
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
    static findByInviteId(inviteId : string)
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
    static findByResetId(resetId : string)
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
    static findByChangeId(changeId : string)
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
    static async findByProviderId(provider : string, id : string) : Promise<Account>
    {
        const log = slog.stepIn(AccountAgent.CLS_NAME, 'findByProviderId');
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
                return null;
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
        return account;
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
        internationalPhoneNo = Utils.encrypt(internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
        return collection().findAuthyId(internationalPhoneNo, excludeAccountId);
    }

    /**
     * アカウント一覧を検索する
     *
     * @return  Account[]。該当するアカウントの一覧を返す
     */
    static async findList(cond : {registered? : boolean, internationalPhoneNo? : string} = {}) : Promise<Account[]>
    {
        if (cond.internationalPhoneNo) {
            cond.internationalPhoneNo = Utils.encrypt(cond.internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
        }

        const data = await collection().findList(cond);
        const models = AccountAgent.toModels(data);

        AccountAgent.decrypts(models);
        return models;
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

        const niu = Utils.nullIfUndefined;
        const model : Account =
        {
            id:                     niu(data.id),
            name:                   niu(data.name),
            user_name:              niu(data.user_name),
            twitter:                niu(data.twitter),
            facebook:               niu(data.facebook),
            google:                 niu(data.google),
            github:                 niu(data.github),
            email:                  niu(data.email),
            password:               niu(data.password),
            country_code:           niu(data.country_code),
            phone_no:               niu(data.phone_no),
            international_phone_no: niu(data.international_phone_no),
            authy_id:               niu(data.authy_id),
            two_factor_auth:        niu(data.two_factor_auth),
            signup_id:              niu(data.signup_id),
            invite_id:              niu(data.invite_id),
            reset_id:               niu(data.reset_id),
            change_id:              niu(data.change_id),
            change_email:           niu(data.change_email),
            crypto_type:            niu(data.crypto_type),
            created_at:             niu(data.created_at),
            updated_at:             niu(data.updated_at),
            deleted_at:             niu(data.deleted_at)
        };
        return model;
    }
}
