/**
 * (C) 2016-2017 printf.jp
 */
import SeqModel from './seq-model';
import Config   from '../config';
import Utils    from '../libs/utils';

import fs =     require('fs');
import __ =     require('lodash');
import moment = require('moment');
import slog =   require('../slog');

/**
 * アカウント
 */
export class Account
{
    id                     : number = null;
    name                   : string = null;
    twitter                : string = null;
    facebook               : string = null;
    google                 : string = null;
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

        if (this.email && this.password)
        {
            count++;
            existsProvider = 'email';
        }

        if (count === 1 && existsProvider === provider)
            return false;

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
 * アカウントモデル
 */
export default class AccountModel
{
    private static CLS_NAME = 'AccountModel';
    private static list : Account[] = null;
    private static backupList : Account[] = null;
    private static path = Config.ROOT_DIR + '/storage/account.json';
    private static MESSAGE_UNINITIALIZE = 'AccountModelが初期化されていません。';

    /**
     * アカウントをJSONファイルからロードする
     */
    static load() : void
    {
        try
        {
            AccountModel.list = [];

            fs.statSync(AccountModel.path);
            const text = fs.readFileSync(AccountModel.path, 'utf8');
            const list = JSON.parse(text);

            for (const obj of list)
            {
                const account = new Account();
                Utils.copy(account, obj);
                AccountModel.list.push(account);
            }
        }
        catch (err)
        {
            AccountModel.list = [];
        }
    }

    /**
     * アカウントをJSONファイルにセーブする
     */
    private static save() : void
    {
        const text = JSON.stringify(AccountModel.list, null, 2);
        fs.writeFileSync(AccountModel.path, text);
    }

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     *
     * @return  なし
     */
    static add(account : Account)
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'add');
        return new Promise((resolve : () => void, reject) =>
        {
            account.id = SeqModel.next('account');
            account.international_phone_no = AccountModel.international_phone_no(account);
            account.crypto_type = 1;
            account.created_at = moment().format('YYYY/MM/DD HH:mm:ss');

            const workAccount = __.clone(account);
            AccountModel.encrypt(workAccount);
            AccountModel.list.push(workAccount);
            AccountModel.save();

            log.stepOut();
            resolve();
        });
    }

    /**
     * アカウントを更新する
     *
     * @param   account アカウント
     *
     * @return  なし
     */
    static update(account : Account)
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'update');
        return new Promise((resolve : () => void, reject) =>
        {
            for (let i in AccountModel.list)
            {
                const findAccount = AccountModel.list[i];
                if (findAccount.id === account.id)
                {
                    __.extend(findAccount, account);
                    findAccount.international_phone_no = AccountModel.international_phone_no(account);
                    findAccount.crypto_type = 1;
                    AccountModel.encrypt(findAccount);
                    AccountModel.save();
                    log.d('更新しました。');
                    break;
                }
            }

            log.stepOut();
            resolve();
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
        log.d(`sessionId:${accountId}`);

        return new Promise((resolve : () => void, reject) =>
        {
            for (let i in AccountModel.list)
            {
                if (AccountModel.list[i].id === accountId)
                {
                    AccountModel.list.splice(Number(i), 1);
                    AccountModel.save();
                    log.d('削除しました。');
                    break;
                }
            }

            log.stepOut();
            resolve();
        });
    }

    /**
     * アカウントを検索する
     *
     * @param   cond    検索条件
     *
     * @return  Account。該当するアカウントを返す
     */
    private static findByCondition(cond : AccountFindCondition) : Promise<Account>
    {
        const log = slog.stepIn(AccountModel.CLS_NAME, 'findByCondition');
        log.d(JSON.stringify(cond, null, 2));

        return new Promise((resolve : AccountResolve, reject) =>
        {
            if (AccountModel.isUninitialize())
            {
                log.stepOut();
                reject(new Error(AccountModel.MESSAGE_UNINITIALIZE));
                return;
            }

            for (const account of AccountModel.list)
            {
                if ((cond.accountId === undefined || account.id        === cond.accountId)
                &&  (cond.signupId  === undefined || account.signup_id === cond.signupId)
                &&  (cond.inviteId  === undefined || account.invite_id === cond.inviteId)
                &&  (cond.resetId   === undefined || account.reset_id  === cond.resetId)
                &&  (cond.changeId  === undefined || account.change_id === cond.changeId))
                {
                    log.d('見つかりました。');
                    const findAccount = __.clone(account);
                    AccountModel.decrypt(findAccount);
                    findAccount.international_phone_no = AccountModel.international_phone_no(account);

                    log.stepOut();
                    resolve(findAccount);
                    return;
                }
            }

            log.d('見つかりませんでした。');
            log.stepOut();
            resolve(null);
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
        return AccountModel.findByCondition({accountId});
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
        return AccountModel.findByCondition({signupId});
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
        return AccountModel.findByCondition({resetId});
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
        return AccountModel.findByCondition({changeId});
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

        return new Promise((resolve : AccountResolve, reject) =>
        {
            if (AccountModel.isUninitialize())
            {
                log.stepOut();
                reject(new Error(AccountModel.MESSAGE_UNINITIALIZE));
                return;
            }

            let account : Account = null;
            if (id)
            {
                if (provider !== 'twitter'
                &&  provider !== 'facebook'
                &&  provider !== 'google'
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

                account = AccountModel.find_by_provider_id(provider, id);

                if (account === null && provider === 'email')
                {
                    // 見つからなければ平文で検索
                    account = AccountModel.find_by_provider_id(provider, email);
                }
            }

            if (account) log.d('見つかりました。');
            else         log.d('見つかりませんでした。');

            log.stepOut();
            resolve(account);
        });
    }

    private static find_by_provider_id(provider : string, id : string) : Account
    {
        for (const account of AccountModel.list)
        {
            if (account[provider] === id)
            {
                const findAccount = __.clone(account);
                AccountModel.decrypt(findAccount);
                findAccount.international_phone_no = AccountModel.international_phone_no(findAccount);
                return findAccount;
            }
        }
        return null;
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
        return new Promise((resolve : (authyId : number) => void, reject) =>
        {
            if (AccountModel.isUninitialize())
            {
                log.stepOut();
                reject(new Error(AccountModel.MESSAGE_UNINITIALIZE));
                return;
            }

            internationalPhoneNo = Utils.encrypt(internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);
            for (const account of AccountModel.list)
            {
                if (excludeAccountId && account.id === excludeAccountId)
                    continue;

                if (account.international_phone_no === internationalPhoneNo)
                {
                    log.d('見つかりました。');
                    log.stepOut();
                    resolve(account.authy_id);
                    return;
                }
            }

            log.d('見つかりませんでした。');
            log.stepOut();
            resolve(null);
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
        return new Promise((resolve : (accounts : Account[]) => void, reject) =>
        {
            if (AccountModel.isUninitialize())
            {
                log.stepOut();
                reject(new Error(AccountModel.MESSAGE_UNINITIALIZE));
                return;
            }

            if (cond.internationalPhoneNo)
                cond.internationalPhoneNo = Utils.encrypt(cond.internationalPhoneNo, Config.CRYPTO_KEY, Config.CRYPTO_IV);

            const accountList : Account[] = [];
            for (const account of AccountModel.list)
            {
                const registered = (account.signup_id === null && account.invite_id === null);

                if ((cond.registered           === undefined || registered                      === cond.registered)
                &&  (cond.internationalPhoneNo === undefined ||  account.international_phone_no === cond.internationalPhoneNo))
                {
                    const obj = __.clone(account);
                    AccountModel.decrypt(obj);
                    accountList.push(obj);
                }
            }

            log.stepOut();
            resolve(accountList);
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

        if (account.email)                  account.email =                  Utils.encrypt(account.email,                  key, iv);
        if (account.phone_no)               account.phone_no =               Utils.encrypt(account.phone_no,               key, iv);
        if (account.international_phone_no) account.international_phone_no = Utils.encrypt(account.international_phone_no, key, iv);
        if (account.change_email)           account.change_email =           Utils.encrypt(account.change_email,           key, iv);
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

            if (account.email)                  account.email =                   Utils.decrypt(account.email,                   key, iv);
            if (account.phone_no)               account.phone_no =                Utils.decrypt(account.phone_no,                key, iv);
            if (account.international_phone_no) account.international_phone_no =  Utils.decrypt(account.international_phone_no,  key, iv);
            if (account.change_email)           account.change_email =            Utils.decrypt(account.change_email,            key, iv);
        }
    }

    /**
     * 国際電話番号取得
     */
    static internationalPhoneNo(countryCode : string, phoneNo : string) : string
    {
        if (countryCode && phoneNo)
        {
            phoneNo = phoneNo.replace(/-/g, '');
            phoneNo = phoneNo.substr(1);    // 先頭の1文字を取り除く（'0'だったら、ではない）
            phoneNo = countryCode + phoneNo;
        }
        else
        {
            phoneNo = null;
        }
        return phoneNo;
    }

    private static international_phone_no(account : Account) : string
    {
        return AccountModel.internationalPhoneNo(account.country_code, account.phone_no);
    }

    /**
     * 未初期化かどうか調べる
     *
     * @return  未初期化ならtrueを返す
     */
    private static isUninitialize() : boolean
    {
        return (AccountModel.list === null);
    }

    /**
     * アカウントをバックアップする
     */
    static _backup() : void
    {
        AccountModel.backupList = __.clone(AccountModel.list);
    }

    /**
     * アカウントをリセットする
     */
    static _reset() : void
    {
        AccountModel.list = [];
        AccountModel.save();
    }

    /**
     * アカウントをリストアする
     */
    static _restore() : void
    {
        AccountModel.list = __.clone(AccountModel.backupList);
        AccountModel.save();
    }
}

/**
 * アカウント検索条件
 */
interface AccountFindCondition
{
    accountId? : number;
    signupId?  : string;
    inviteId?  : string;
    resetId?   : string;
    changeId?  : string;
}

/**
 * アカウント一覧検索条件
 */
interface AccountFindListCondition
{
    registered?           : boolean;
    internationalPhoneNo? : string;
}

interface AccountResolve {(account : Account) : void}
