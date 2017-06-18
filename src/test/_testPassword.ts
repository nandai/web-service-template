/**
 * (C) 2017 printf.jp
 */
import test       from 'ava';
import {Response} from 'libs/response';
import Validator  from 'server/libs/validator';

import slog = require('server/slog');
const locale = 'ja';

export function testPassword()
{
    test.serial('パスワード検証 No.1', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = null;
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 No.2', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567';
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 No.3', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '12345678';
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('パスワード検証 No.4', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '1234567890123456';
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('パスワード検証 No.5', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = '12345678901234567';
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('パスワード検証 No.6', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const password = 'あいうえおかきくけこ';
        const result = Validator.password(password, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });
}
