/**
 * (C) 2017 printf.jp
 */
import test                        from 'ava';
import Config                      from 'server/config';
import MongoDB                     from 'server/database/mongodb';
import MySQL                       from 'server/database/mysql';
import R                           from 'server/libs/r';
import {testAccountNameValid}      from './_testAccountNameValid';
import {testEmailValid}            from './_testEmailValid';
import {testIsChangePasswordValid} from './_testIsChangePasswordValid';
import {testPasswordValid}         from './_testPasswordValid';
import {testUserNameValid}         from './_testUserNameValid';

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

testAccountNameValid();
testEmailValid();
testIsChangePasswordValid();
testPasswordValid();
testUserNameValid();
