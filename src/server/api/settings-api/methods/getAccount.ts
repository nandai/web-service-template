/**
 * (C) 2016-2017 printf.jp
 */
import {Response}        from 'libs/response';
import {slog}            from 'libs/slog';
import AccountAgent      from 'server/agents/account-agent';
import LoginHistoryAgent from 'server/agents/login-history-agent';
import SessionAgent      from 'server/agents/session-agent';
import Converter         from 'server/libs/converter';
import {Account}         from 'server/models/account';
import {LoginHistory}    from 'server/models/login-history';
import {Session}         from 'server/models/session';

import express = require('express');

/**
 * アカウント取得
 */
export async function getAccount(req : express.Request) : Promise<Response.GetAccount>
{
    const log = slog.stepIn('SettingsApi', 'getAccount');
    const session    : Session = req.ext.session;
    let account      : Account =      null;
    let loginHistory : LoginHistory = null;

    if (SessionAgent.isLogin(session))
    {
        const {account_id} = session;

        account =      await AccountAgent.find(account_id);
        loginHistory = await LoginHistoryAgent.findLatest(account_id);
    }

    const data : Response.GetAccount =
    {
        status:  Response.Status.OK,
        account: Converter.accountToResponse(account, loginHistory)
    };

    log.stepOut();
    return data;
}
