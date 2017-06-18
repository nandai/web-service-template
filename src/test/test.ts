/**
 * (C) 2017 printf.jp
 */
import test                   from 'ava';
import {Response}             from 'libs/response';
import AccountAgent           from 'server/agents/account-agent';
import {isResetPasswordValid} from 'server/api/reset-api/methods/onResetPassword';
import Config                 from 'server/config';
import MongoDB                from 'server/database/mongodb';
import MySQL                  from 'server/database/mysql';
import R                      from 'server/libs/r';
import {Account}              from 'server/models/account';

import slog = require('server/slog');
const locale = 'ja';

test.before(async (t) =>
{
        try
        {
            slog.setConfig( 'ws://localhost:8080', 'webServiceTemplateTest.log', 'ALL', 'slog', 'gols');

            Config.load();
            R     .load();

            await MongoDB.init();
            await MySQL  .init();
        }
        catch (err) {console.log(err);}
    // });
});

test.after.always((t) =>
{
    return new Promise(async (resolve) =>
    {
        // すぐに終了するとログが出力されないので数秒待ってから終了する
        setTimeout(() =>
        {
            resolve();
        }, 3000);
    });
});

function testIsResetPasswordValid()
{
    test.serial('パスワードリセット検証 No.1', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const result = await isResetPasswordValid(null, '12345678901234567890', null, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワードリセット検証 No.2', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const result = await isResetPasswordValid(null, '1234567890123456', null, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワードリセット検証 No.3', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const result = await isResetPasswordValid('resetId-a', '1234567890123456', '1234567890123456', locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワードリセット検証 No.4', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const reset_id = 'resetId-b';
        let account : Account = {reset_id};
        account = await AccountAgent.add(account);

        const result = await isResetPasswordValid(reset_id, '1234567890123456', '1234567890123456', locale);
        const {status} = result;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });
}

testIsResetPasswordValid();
