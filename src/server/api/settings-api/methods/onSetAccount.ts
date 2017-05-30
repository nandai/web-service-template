/**
 * (C) 2016-2017 printf.jp
 */
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';
import Authy                   from 'server/libs/authy';
import Converter               from 'server/libs/converter';
import R                       from 'server/libs/r';
import Utils                   from 'server/libs/utils';
import AccountModel, {Account} from 'server/models/account-model';
import {Session}               from 'server/models/session-model';

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
                name:          ['string', null, true],
                countryCode:   ['string', null, true],
                phoneNo:       ['string', null, true],
                twoFactorAuth: ['string', null, true]
            };

            log.d(JSON.stringify(param, null, 2));

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const name =          <string>param.name;
            const countryCode =   <string>param.countryCode;
            const phoneNo =       <string>param.phoneNo;
            let   twoFactorAuth = <string>param.twoFactorAuth;

            // 検証
            const result = isValid(name, countryCode, phoneNo, twoFactorAuth);
            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, R.text(result.phrase, locale));
                break;
            }

            let phrase = R.SETTINGS_COMPLETED;

            // Authyからユーザーを削除する／しない
            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);
            const newCountryCode = (countryCode && countryCode.length > 0 ? countryCode : null);
            const newPhoneNo =     (phoneNo     && phoneNo    .length > 0 ? phoneNo     : null);
            const prevInternationalPhoneNo = AccountModel.internationalPhoneNo(account.country_code, account.phone_no);
            const newInternationalPhoneNo =  AccountModel.internationalPhoneNo(newCountryCode, newPhoneNo);

            if (shouldAuthyUserDelete(account, prevInternationalPhoneNo, newInternationalPhoneNo))
            {
                const authyId = await AccountModel.findAuthyId(prevInternationalPhoneNo, account.id);
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
                    const authyId = await AccountModel.findAuthyId(newInternationalPhoneNo);
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

            // アカウント情報更新
            account.name =            name;
            account.country_code =    newCountryCode;
            account.phone_no =        newPhoneNo;
            account.two_factor_auth = twoFactorAuth;
            await AccountModel.update(account);

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
function isValid(name : string, countryCode : string, phoneNo : string, twoFactorAuth : string)
{
    let status = Response.Status.OK;
    let phrase : string;

    do
    {
        // アカウント名チェック
        name = name || '';
        if (name !== name.trim())
        {
            status = Response.Status.FAILED;
            phrase = R.CANNOT_ENTER_BEFORE_AFTER_SPACE;
            break;
        }

        const len = name.length;
        if (len < 1 || 20 < len)
        {
            status = Response.Status.FAILED;
            phrase = R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG;
            break;
        }

        // 国コードチェック
        if (countryCode)
        {
            const countries : any[] = lookup.countries({countryCallingCodes:countryCode});
            if (countries.length === 0)
            {
                status = Response.Status.FAILED;
                phrase = R.INVALID_COUNTRY_CODE;
                break;
            }
        }

        // 二段階認証方式チェック
        if (twoFactorAuth === 'SMS'
        ||  twoFactorAuth === 'Authy')
        {
            if (countryCode === null || phoneNo === null)
            {
                status = Response.Status.FAILED;
                phrase = R.REQUIRE_COUNTRY_CODE_AND_PHONE_NO;
                break;
            }
        }

        else if (twoFactorAuth !== null)
        {
            status = Response.Status.BAD_REQUEST;
            phrase = R.BAD_REQUEST;
            break;
        }
    }
    while (false);
    return ({status, phrase});
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
