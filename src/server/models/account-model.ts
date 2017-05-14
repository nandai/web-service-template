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
    id              : number = null;
    name            : string = null;
    twitter         : string = null;
    facebook        : string = null;
    google          : string = null;
    email           : string = null;
    password        : string = null;
    phone_no        : string = null;
    authy_id        : number = null;
    two_factor_auth : string = null;
    signup_id       : string = null;
    reset_id        : string = null;
    change_id       : string = null;
    change_email    : string = null;
    sms_code        : string = null;
    created_at      : string = null;
    deleted_at      : string = null;

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
            account.created_at = moment().format('YYYY/MM/DD HH:mm:ss');
            AccountModel.list.push(account);
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
                if (AccountModel.list[i].id === account.id)
                {
                    __.extend(AccountModel.list[i], account);
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
                &&  (cond.resetId   === undefined || account.reset_id  === cond.resetId)
                &&  (cond.changeId  === undefined || account.change_id === cond.changeId))
                {
                    log.d('見つかりました。');
                    const findAccount : Account = __.clone(account);

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

                for (const account of AccountModel.list)
                {
                    if (account[provider] === id)
                    {
                        log.d('見つかりました。');
                        const findAccount : Account = __.clone(account);

                        log.stepOut();
                        resolve(findAccount);
                        return;
                    }
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
    static findList()
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

            const accountList : Account[] = [];
            for (const account of AccountModel.list)
                accountList.push(account);

            log.stepOut();
            resolve(accountList);
        });
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
export interface AccountFindCondition
{
    accountId? : number;
    signupId?  : string;
    resetId?   : string;
    changeId?  : string;
}

interface AccountResolve {(account : Account) : void}
