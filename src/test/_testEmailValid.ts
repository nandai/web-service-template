/**
 * (C) 2017 printf.jp
 */
import test       from 'ava';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';
import Validator  from 'server/libs/validator';
import {Account}  from 'server/models/account';

const locale = 'ja';

export function testEmailValid()
{
    test.serial('メールアドレス検証 - nullの時は失敗すること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = null;
        const accountId = 0;
        const account : Account = null;
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - 正しくない時は失敗すること(1)', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example';
        const accountId = 0;
        const account : Account = null;
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - 正しくない時は失敗すること(2)', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = '@example';
        const accountId = 0;
        const account : Account = null;
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - 正しくない時は失敗すること(3)', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example@';
        const accountId = 0;
        const account : Account = null;
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - 正しくない時は失敗すること(4)', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example@aiueo';
        const accountId = 0;
        const account : Account = null;
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - 同じメールアドレスが存在する時は失敗すること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example@aiueo.com';
        const accountId = 123;
        const account : Account = {id:456};
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - ドメインが存在しない時は失敗すること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example@aiueo.com';
        const accountId = 123;
        const account : Account = {id:123};
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('メールアドレス検証 - ドメインが存在する時は成功すること', async (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const email = 'example@gmail.com';
        const accountId = 123;
        const account : Account = {id:123};
        const result = await Validator.email(email, accountId, account, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });
}
