/**
 * (C) 2017 printf.jp
 */
import test       from 'ava';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';
import Validator  from 'server/libs/validator';
import {Account}  from 'server/models/account';

const locale = 'ja';

export function testUserNameValid()
{
    test.serial('ユーザー名検証 - nullは成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = null;
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 前や後にスペースがある時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = ' username';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 有効な最大文字数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = 'ABCDEF78901234567890';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 長すぎる時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = '123456789012345678901';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 数字のみは失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = '12345678901234567890';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 英数以外の時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = 'あいうえおかきくけこ';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 英数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = 'ABC456789_abc4567890';
        const accountId = 0;
        const account = null;
        const result = Validator.userName(userName, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 同名のユーザーがいる場合は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = 'ABC456789_abc4567890';
        const accountId = 123;
        const alreadyExistsAccount : Account = {id:456};
        const result = Validator.userName(userName, accountId, alreadyExistsAccount, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('ユーザー名検証 - 同名のユーザーがいない場合は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const userName = 'ABC456789_abc4567890';
        const accountId = 123;
        const alreadyExistsAccount : Account = {id:123};
        const result = Validator.userName(userName, accountId, alreadyExistsAccount, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });
}
