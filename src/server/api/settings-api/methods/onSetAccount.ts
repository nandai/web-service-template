/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import Authy        from 'server/libs/authy';
import Converter    from 'server/libs/converter';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';
import {Session}    from 'server/models/session';

import express = require('express');
import slog =    require('server/slog');

const lookup = require('country-data').lookup;

/**
 * アカウント設定<br>
 * PUT /api/settings/account
 */
export async function onSetAccount(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onSetAccount');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.SetAccount = req.body;
            const condition : Request.SetAccount =
            {
                name:          ['string', null, true] as any,
                userName:      ['string', null, true] as any,
                countryCode:   ['string', null, true] as any,
                phoneNo:       ['string', null, true] as any,
                twoFactorAuth: ['string', null, true] as any
            };

            log.d(JSON.stringify(param, null, 2));

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const {name, userName, countryCode, phoneNo} = param;
            let {twoFactorAuth} = param;

            // 検証
            const session : Session = req.ext.session;
            const result = await isSetAccountValid(param, session.account_id, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
                break;
            }

            let phrase = R.SETTINGS_COMPLETED;

            // Authyからユーザーを削除する／しない
            const account = await AccountAgent.find(session.account_id);
            const newCountryCode = (countryCode && countryCode.length > 0 ? countryCode : null);
            const newPhoneNo =     (phoneNo     && phoneNo    .length > 0 ? phoneNo     : null);

            if (Config.hasAuthy())
            {
                const prevInternationalPhoneNo = AccountAgent.internationalPhoneNo(account.country_code, account.phone_no);
                const newInternationalPhoneNo =  AccountAgent.internationalPhoneNo(newCountryCode, newPhoneNo);

                if (shouldAuthyUserDelete(account, prevInternationalPhoneNo, newInternationalPhoneNo))
                {
                    const authyId = await AccountAgent.findAuthyId(prevInternationalPhoneNo, account.id);
                    if (authyId === null)
                    {
                        log.d('現在のアカウントの他には同じ電話番号がないのでAuthyからユーザーを削除します。');
                        await Authy.deleteUser(account.authy_id);
                    }
                    else
                    {
                        log.d('現在のアカウントの他に同じ電話番号があるのでAuthyからユーザー削除はしません。');
                    }
                    account.authy_id = null;
                }

                // Authyにユーザーを登録する／しない
                if (shouldAuthyUserRegister(twoFactorAuth, account, prevInternationalPhoneNo, newInternationalPhoneNo))
                {
                    if (account.email === null)
                    {
                        twoFactorAuth = account.two_factor_auth;
                        phrase = R.CANNOT_PERFORMED_WITH_AUTHY;
                    }
                    else
                    {
                        const authyId = await AccountAgent.findAuthyId(newInternationalPhoneNo);
                        if (authyId === null)
                        {
                            log.d('現在のアカウントの他に同じ電話番号がないのでAuthyにユーザーを登録します。');
                            account.authy_id = await Authy.registerUser(account.email, newCountryCode.substr(1), newPhoneNo);
                        }
                        else
                        {
                            log.d('現在のアカウントの他にも同じ電話番号があるのでAuthyにユーザー登録はしません。');
                            account.authy_id = authyId;
                        }
                    }
                }
            }

            // アカウント情報更新
            account.name =            name;
            account.user_name =       userName;
            account.country_code =    newCountryCode;
            account.phone_no =        newPhoneNo;
            account.two_factor_auth = twoFactorAuth;
            await AccountAgent.update(account);

            const data : Response.SetAccount =
            {
                status:  Response.Status.OK,
                account: Converter.accountToResponse(account),
                message: R.text(phrase, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * 検証
 */
export function isSetAccountValid(param : Request.SetAccount, myAccountId : number, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'isSetAccountValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};
            const {name, userName, countryCode, phoneNo, twoFactorAuth} = param;

            do
            {
                // アカウント名チェック
                const accountNameResult = Validator.accountName(name, locale);
                if (accountNameResult.status !== Response.Status.OK)
                {
                    result.status =  accountNameResult.status;
                    result.message = accountNameResult.message;
                    break;
                }

                // ユーザー名チェック
                const alreadyExistsAccount = await AccountAgent.findByUserName(userName);
                const userNameResult = Validator.userName(userName, myAccountId, alreadyExistsAccount, locale);

                if (userNameResult.status !== Response.Status.OK)
                {
                    result.status =  userNameResult.status;
                    result.message = userNameResult.message;
                    break;
                }

                // 国コードチェック
                if (countryCode)
                {
                    const countries : any[] = lookup.countries({countryCallingCodes:countryCode});
                    if (countries.length === 0)
                    {
                        result.status = Response.Status.FAILED;
                        result.message = R.text(R.INVALID_COUNTRY_CODE, locale);
                        break;
                    }
                }

                // 二段階認証方式チェック
                if (twoFactorAuth === 'SMS'
                ||  twoFactorAuth === 'Authy')
                {
                    if (countryCode === null || phoneNo === null)
                    {
                        result.status = Response.Status.FAILED;
                        result.message = R.text(R.REQUIRE_COUNTRY_CODE_AND_PHONE_NO, locale);
                        break;
                    }
                }

                else if (twoFactorAuth !== null)
                {
                    result.status = Response.Status.BAD_REQUEST;
                    result.message = R.text(R.BAD_REQUEST, locale);
                    break;
                }
            }
            while (false);

            if (result.status !== Response.Status.OK) {
                log.w(JSON.stringify(result, null, 2));
            }

            log.stepOut();
            resolve(result);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

/**
 * Authyからユーザー削除するべきかどうか
 */
function shouldAuthyUserDelete(
    account                  : Account,
    prevInternationalPhoneNo : string,
    newInternationalPhoneNo  : string) : boolean
{
    const log = slog.stepIn('onSetAccount.ts', 'shouldAuthyUserDelete');
    let result = false;

    do
    {
        if (account.authy_id === null)
        {
            log.d('Authy IDがないので削除の必要はありません。');
            break;
        }

        if (prevInternationalPhoneNo === newInternationalPhoneNo)
        {
            log.d('電話番号に変更がないので削除の必要はありません。');
            break;
        }

        log.d('削除が必要です。');
        result = true;
    }
    while (false);

    log.stepOut();
    return result;
}

/**
 * Authyにユーザー登録するべきかどうか
 */
function shouldAuthyUserRegister(
    twoFactorAuth            : string,
    account                  : Account,
    prevInternationalPhoneNo : string,
    newInternationalPhoneNo  : string) : boolean
{
    const log = slog.stepIn('onSetAccount.ts', 'shouldAuthyUserRegister');
    let result = false;

    do
    {
        if (twoFactorAuth !== 'Authy')
        {
            log.d('二段階認証方式がAuthyではないので登録の必要はありません。');
            break;
        }

        if (newInternationalPhoneNo === null)
        {
            log.d('電話番号が設定されていないので登録の必要はありません。');
            break;
        }

        if (account.authy_id === null)
        {
            log.d('Authy IDがないので登録が必要です。');
            result = true;
            break;
        }

        if (prevInternationalPhoneNo === newInternationalPhoneNo)
        {
            log.d('電話番号に変更がないので登録の必要はありません。');
            break;
        }

        log.d('登録が必要です。');
        result = true;
    }
    while (false);

    log.stepOut();
    return result;
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
}
