/**
 * (C) 2017 printf.jp
 */
import test                        from 'ava';
import Config                      from 'server/config';
import MongoDB                     from 'server/database/mongodb';
import MySQL                       from 'server/database/mysql';
import R                           from 'server/libs/r';
import {testIsChangePasswordValid} from './_testIsChangePasswordValid';
import {testIsResetPasswordValid}  from './_testIsResetPasswordValid';
import {testPasswordValid}         from './_testPasswordValid';

import slog = require('server/slog');

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

testPasswordValid();
testIsResetPasswordValid();
testIsChangePasswordValid();
