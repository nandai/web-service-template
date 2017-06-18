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
    test.serial('パスワード変更の入力値検証 No.1', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const param : Request.ChangePassword =
        {
            oldPassword: null,
            newPassword: '1234567890123456',
            confirm:     null
        };
        const accountId = 0;
        const result = await isChangePasswordValid(param, accountId, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.2', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const param : Request.ChangePassword =
        {
            oldPassword: null,
            newPassword: '1234567890123456',
            confirm:     '1234567890123456'
        };
        const accountId = 0;
        const result = await isChangePasswordValid(param, accountId, locale);
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.3', async (t) =>
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
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.4', async (t) =>
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
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.5', async (t) =>
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
        const {status} = result;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.6', async (t) =>
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
        const {status} = result;

        t.is(status, Response.Status.FAILED);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });

    test.serial('パスワード変更の入力値検証 No.7', async (t) =>
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
        const {status} = result;

        t.is(status, Response.Status.OK);
        await AccountAgent.remove(account.id);
        log.stepOut();
    });
}
