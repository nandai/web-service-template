/**
 * (C) 2017 printf.jp
 */
import test                    from 'ava';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';
import AccountAgent            from 'server/agents/account-agent';
import {isResetPasswordValid}  from 'server/api/reset-api/methods/onResetPassword';
import {Account}               from 'server/models/account';

import slog = require('server/slog');
const locale = 'ja';

export function testIsResetPasswordValid()
{
    test.serial('パスワードリセットの入力値検証 No.1', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const param : Request.ResetPassword =
        {
            resetId:  null,
            password: '1234567890123456',
            confirm:  null
        };
        const result = await isResetPasswordValid(param, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワードリセットの入力値検証 No.2', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const param : Request.ResetPassword =
        {
            resetId:  'resetId',
            password: '1234567890123456',
            confirm:  '1234567890123456'
        };
        const result = await isResetPasswordValid(param, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワードリセットの入力値検証 No.3', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const reset_id = 'resetId';
        let account : Account = {reset_id};
        account = await AccountAgent.add(account);

        const param : Request.ResetPassword =
        {
            resetId:  reset_id,
            password: '1234567890123456',
            confirm:  '1234567890123456'
        };
        const result = await isResetPasswordValid(param, locale);
        const {status} = result;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });
}
