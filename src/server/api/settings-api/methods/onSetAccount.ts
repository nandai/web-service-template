/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import Authy        from 'server/libs/authy';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';
import {Session}    from 'server/models/session-model';

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
            const twoFactorAuth = <string>param.twoFactorAuth;

            // アカウント名チェック
            const len = name.length;

            if (len < 1 || 20 < len)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG, locale));
                break;
            }

            // 国コードチェック
            if (countryCode)
            {
                const countries : any[] = lookup.countries({countryCallingCodes:countryCode});
                if (countries.length === 0)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_COUNTRY_CODE, locale));
                    break;
                }
            }

            // 二段階認証方式チェック
            switch (twoFactorAuth)
            {
                case 'SMS':
                case 'Authy':
                case null:
                    break;

                default:
                    res.ext.badRequest(locale);
                    break;
            }

            // アカウント情報更新
            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);
            const prevCountryCode = account.country_code;
            const prevPhoneNo =     account.phone_no;
            const newCountryCode = (countryCode && countryCode.length > 0 ? countryCode : null);
            const newPhoneNo =     (phoneNo     && phoneNo    .length > 0 ? phoneNo     : null);

            if (account.authy_id && prevPhoneNo && prevPhoneNo !== newPhoneNo)
            {
                const internationalPhoneNo = AccountModel.internationalPhoneNo(prevCountryCode, prevPhoneNo);
                const authyId = await AccountModel.findAuthyId(internationalPhoneNo, account.id);

                if (authyId === null)
                {
                    // 他に同じ電話番号がなければauthyからユーザー削除
                    await Authy.deleteUser(account.authy_id);
                }

                account.authy_id = null;
            }

            if (twoFactorAuth === 'Authy'
            && account.email
            && newCountryCode
            && newPhoneNo
            && (newCountryCode !== prevCountryCode || newPhoneNo !== prevPhoneNo || account.authy_id === null))
            {
                const internationalPhoneNo = AccountModel.internationalPhoneNo(newCountryCode, newPhoneNo);
                const authyId = await AccountModel.findAuthyId(internationalPhoneNo);

                if (authyId === null)
                {
                    // 同じ電話番号がなければauthyにユーザー登録
                    account.authy_id = await Authy.registerUser(account.email, newCountryCode.substr(1), newPhoneNo);
                }
                else
                {
                    // 同じ電話番号があればそのauthy_idを設定
                    account.authy_id = authyId;
                }
            }

            account.name =            name;
            account.country_code =    newCountryCode;
            account.phone_no =        newPhoneNo;
            account.two_factor_auth = twoFactorAuth;
            await AccountModel.update(account);

            const data : Response.SetAccount =
            {
                status:  1,
                message: R.text(R.SETTINGS_COMPLETED, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
