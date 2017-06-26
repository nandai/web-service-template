/**
 * (C) 2017 printf.jp
 */
import test                    from 'ava';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';
import AccountAgent            from 'server/agents/account-agent';
import {isChangePasswordValid} from 'server/api/settings-api/methods/onChangePassword';
import Config                  from 'server/config';
import Utils                   from 'server/libs/utils';
import {Account}               from 'server/models/account';

import slog = require('server/slog');
const locale = 'ja';

export function testIsChangePasswordValid()
{
    test.serial('パスワード変更の入力値検証 - メールアドレスが未設定の時は設定できないこと', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        let account : Account =
        {
            email:    null,
            password: null
        };
        account = await AccountAgent.add(account);

        const param : Request.ChangePassword =
        {
            oldPassword: null,
            newPassword: '1234567890123456',
            confirm:     null
        };
        const result = await isChangePasswordValid(param, account.id, locale);
        const {status} = result.response;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 - メールアドレス以外に認証手段がない時はパスワードなしに変更できないこと', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        let account : Account =
        {
            email:    'admin@example.com',
            password: '12345678'
        };
        account.password = Utils.getHashPassword(account.email, account.password, Config.PASSWORD_SALT);
        account = await AccountAgent.add(account);

        const param : Request.ChangePassword =
        {
            oldPassword: null,
            newPassword: null,
            confirm:     null
        };
        const result = await isChangePasswordValid(param, account.id, locale);
        const {status} = result.response;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 - メールアドレス以外に認証手段がある時はパスワードなしに変更できること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        let account : Account =
        {
            email:    'admin@example.com',
            password: '12345678',
            twitter:  'twitter'
        };
        account.password = Utils.getHashPassword(account.email, account.password, Config.PASSWORD_SALT);
        account = await AccountAgent.add(account);

        const param : Request.ChangePassword =
        {
            oldPassword: '12345678',
            newPassword: null,
            confirm:     null,
        };
        const result = await isChangePasswordValid(param, account.id, locale);
        const {status} = result.response;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 - 現在のパスワードと現在のパスワードとして入力されたパスワードが一致しない時は変更できないこと', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        let account : Account =
        {
            email:    'admin@example.com',
            password: '12345678'
        };
        account.password = Utils.getHashPassword(account.email, account.password, Config.PASSWORD_SALT);
        account = await AccountAgent.add(account);

        const param : Request.ChangePassword =
        {
            oldPassword: null,
            newPassword: '1234567890123456',
            confirm:     '1234567890123456'
        };
        const result = await isChangePasswordValid(param, account.id, locale);
        const {status} = result.response;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 - 現在のパスワードと現在のパスワードとして入力されたパスワードが一致する時は変更できること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        let account : Account =
        {
            email:    'admin@example.com',
            password: '12345678'
        };
        account.password = Utils.getHashPassword(account.email, account.password, Config.PASSWORD_SALT);
        account = await AccountAgent.add(account);

        const param : Request.ChangePassword =
        {
            oldPassword: '12345678',
            newPassword: '1234567890123456',
            confirm:     '1234567890123456'
        };
        const result = await isChangePasswordValid(param, account.id, locale);
        const {status} = result.response;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });
}
