/**
 * (C) 2017 printf.jp
 */
import test       from 'ava';
import {Response} from 'libs/response';
import Validator  from 'server/libs/validator';

import slog = require('server/slog');
const locale = 'ja';

export function testAccountNameValid()
{
    test.serial('アカウント名検証 - 前や後にスペースがある時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const accountName = ' accountName';
        const result = Validator.accountName(accountName, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('アカウント名検証 - 短すぎる時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const accountName = '';
        const result = Validator.accountName(accountName, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });

    test.serial('アカウント名検証 - 有効な最小文字数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const accountName = '1';
        const result = Validator.accountName(accountName, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('アカウント名検証 - 有効な最大文字数の時は成功すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const accountName = '12345678901234567890';
        const result = Validator.accountName(accountName, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.OK);
        log.stepOut();
    });

    test.serial('アカウント名検証 - 長すぎる時は失敗すること', (t) =>
    {
        const log = slog.stepIn('test', t['_test'].title);
        const accountName = '123456789012345678901';
        const result = Validator.accountName(accountName, locale);
        const {status} = result;

        log.d(JSON.stringify(result, null, 2));
        t.is(status, Response.Status.FAILED);
        log.stepOut();
    });
}
