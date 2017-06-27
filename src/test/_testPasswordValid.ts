/**
 * (C) 2017 printf.jp
 */
import test       from 'ava';
import {Response} from 'libs/response';
import Validator  from 'server/libs/validator';

import slog = require('server/slog');
const locale = 'ja';

export function testPasswordValid()
{
    test.serial('パスワード検証 - パスワードがnullで確認用パスワードがない時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = null;
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - null不可の時はパスワードと確認用パスワードがnullで一致していても失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = null;
        const confirm =  null;
        const result = Validator.password({password, confirm}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - null可の時はパスワードと確認用パスワードがnullで一致していれば成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = null;
        const confirm =  null;
        const canNull = true;
        const result = Validator.password({password, confirm, canNull:true}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('パスワード検証 - 短すぎる時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567';
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - 有効な最小文字数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '12345678';
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('パスワード検証 - 有効な最大文字数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567890123456';
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('パスワード検証 - 長すぎる時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '12345678901234567';
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - 英数以外の時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = 'あいうえおかきくけこ';
        const result = Validator.password({password}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - 確認用パスワード（null）と一致しない時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567890123456';
        const confirm =  null;
        const result = Validator.password({password, confirm}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - 確認用パスワードと一致しない時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567890123456';
        const confirm =  '12345678';
        const result = Validator.password({password, confirm}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 - 確認用パスワードと一致する時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567890123456';
        const confirm =  '1234567890123456';
        const result = Validator.password({password, confirm}, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });
}
