/**
 * (C) 2016 printf.jp
 */
import TestConfig        from './test-config';
import Config            from '../config';
import SeqModel          from '../models/seq-model';
import AccountModel      from '../models/account-model';
import SessionModel      from '../models/session-model';
import LoginHistoryModel from '../models/login-history-model';
import Cookie            from '../libs/cookie';
import Twitter           from '../auth/twitter';
import Facebook          from '../auth/facebook';

const co =       require('co');
const readline = require('readline');
const slog =     require('../slog');

/**
 * 
 */
class Response
{
    callback = null;
    _cookies = {};
    _redirect = '';

    constructor(callback)
    {
        this.callback = callback;
    }

    cookie(name : string, value)
    {
        this._cookies[name] = value;
    }

    clearCookie(name : string)
    {
        this._cookies[name] = undefined;
    }
 
    status()
    {
        return this
    }
 
    send()
    {
        this.callback();
    }
 
    redirect(url : string)
    {
        this._redirect = url;
        this.callback();
    }
}

/**
 * テスト
 */
class Test
{
    sessionId : string;
    req = {};

    twitter()
    {
        const self = this;
        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                yield self.twitter01();
                yield self.twitter02();
                resolve();
            });
        });
    }

    twitter01()
    {
        return new Promise((resolve, reject) =>
        {
            const log = slog.stepIn('Test', 'twitter01');
            this.req =
            {
                cookies:
                {
                    command: 'signup'
                },
                user:
                {
                    provider: 'twitter',
                    accessToken:  TestConfig.TWITTER_ACCESS_TOKEN,
                    refreshToken: TestConfig.TWITTER_REFRESH_TOKEN,
                    id:           TestConfig.TWITTER_ID
                }
            };

            const res = new Response(() =>
            {
//              console.log(JSON.stringify(res._cookies, null, 2));
                this.sessionId = res._cookies['sessionId'];
                log.assert('クッキーにセッションIDがあること', this.sessionId !== undefined);
                log.assert('リダイレクト先がトップページであること', res._redirect === '/');
                resolve();
            });

            ((req, res) => Twitter.callback(req, res))(this.req, res);
        });
    }

    twitter02()
    {
        return new Promise((resolve, reject) =>
        {
            const log = slog.stepIn('Test', 'twitter02');
            const res = new Response(() =>
            {
//              console.log(JSON.stringify(res._cookies, null, 2));
                const messageId = res._cookies['messageId'];
                log.assert('クッキーに想定するメッセージIDがあること', messageId === Cookie.MESSAGE_ALREADY_SIGNUP);
                log.assert('リダイレクト先がサインアップページであること', res._redirect === '/signup');
                resolve();
            });

            ((req, res) => Twitter.callback(req, res))(this.req, res);
        });
    }

    facebook()
    {
        const self = this;
        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                yield self.facebook01();
                yield self.facebook02();
                resolve();
            });
        });
    }

    facebook01()
    {
        return new Promise((resolve, reject) =>
        {
            const log = slog.stepIn('Test', 'facebook01');
            this.req =
            {
                cookies:
                {
                    command: 'signup'
                },
                user:
                {
                    provider: 'facebook',
                    accessToken:  TestConfig.FACEBOOK_ACCESS_TOKEN,
                    refreshToken: '',
                    id:           TestConfig.FACEBOOK_ID
                }
            };

            const res = new Response(() =>
            {
//              console.log(JSON.stringify(res._cookies, null, 2));
                this.sessionId = res._cookies['sessionId'];
                log.assert('クッキーにセッションIDがあること', this.sessionId !== undefined);
                log.assert('リダイレクト先がトップページであること', res._redirect === '/');
                resolve();
            });

            ((req, res) => Facebook.callback(req, res))(this.req, res);
        });
    }

    facebook02()
    {
        return new Promise((resolve, reject) =>
        {
            const log = slog.stepIn('Test', 'facebook02');
            const res = new Response(() =>
            {
//              console.log(JSON.stringify(res._cookies, null, 2));
                const messageId = res._cookies['messageId'];
                log.assert('クッキーに想定するメッセージIDがあること', messageId === Cookie.MESSAGE_ALREADY_SIGNUP);
                log.assert('リダイレクト先がサインアップページであること', res._redirect === '/signup');
                resolve();
            });

            ((req, res) => Facebook.callback(req, res))(this.req, res);
        });
    }
}

/**
 * メイン
 */
function main()
{
    co(function* ()
    {
        slog.setConfig('ws://localhost:8080', 'webServiceTemplateTest.log', 'ALL', 'slog', 'gols');

        TestConfig.       load();
        Config.           load();
        SeqModel.         load();
        AccountModel.     load();
        SessionModel.     load();
        LoginHistoryModel.load();

        AccountModel._backup();
        AccountModel._reset();

        const rl = readline.createInterface(
        {
            input:  process.stdin,
            output: process.stdout
        });

//      rl.question('テストを開始します。', (answer) =>
//      {
            const test = new Test();

            yield test.twitter();
            yield test.facebook();

            rl.question('テストが終了しました。', (answer) =>
            {
                AccountModel._restore();
                rl.close();

                setTimeout(() => process.exit(), 300);
            });
//      });
    });
}

main();
