/**
 * (C) 2016-2017 printf.jp
 */
import Config from '../config';

import express = require('express');
import crypt =   require('crypto');
import mailer =  require('nodemailer');
import smtp =    require('nodemailer-smtp-transport');
import slog =    require('../slog');
const Random =   require("random-js");

const random = new Random(Random.engines.mt19937().autoSeed());

/**
 * ユーティリティ
 */
export default class Utils
{
    private static CLS_NAME = 'Utils';

    /**
     * サーバーエラーを送信する
     */
    static internalServerError(err : Error, res : express.Response, log)
    {
        res.status(500).send('Internal Server Error');
        log.e(err.message);
        log.stepOut();
    }

    /**
     * パラメータが存在するかどうか
     *
     * @param   target      検査対象のオブジェクト
     * @param   condition   パラメータの条件
     *
     * @return  コマンドパラメータが存在する場合はtrue
     */
    static existsParameters(target, condition) : boolean
    {
        const log = slog.stepIn(Utils.CLS_NAME, 'existsParameters');
        let exists = true;
        let name;

        for (name in condition)
        {
            const cond = condition[name];
            const type : string =     cond[0];
            const defaultValue =      cond[1];
            const require : boolean = cond[2];
            let err = false;

            if (name in target)
            {
                if (type === 'number')
                {
                    const value = target[name];
                    target[name] = Utils.toNumber(value);
                }
            }
            else
            {
                if (require === true)
                {
                    log.w(name + 'がありませんでした。');
                    err = true;
                }
                else
                {
                    log.i(name + 'がありませんでした。デフォルト値を使用します。');
                    target[name] = defaultValue;
                }
            }

            if (err === false)
            {
                // 型チェック
                if (target[name] !== null && typeof target[name] !== type)
                {
                    log.w(name + 'の型が正しくありません。');
                    err = true;
                }
            }

            if (err)
                exists = false;
        }

        log.stepOut();
        return exists;
    }

    /**
     * 数値に変換する
     *
     * @param   value 数値に変換する任意のデータ。変換できなかった場合はこれをそのまま返す
     */
    private static toNumber(value) : any
    {
        let result = value;
        if (value !== null)
        {
            const num = Number(value);

            if (Number.isNaN(num) === false)
                result = num;
        }
        return result;
    }

    /**
     * パスワード検証
     *
     * @param   password    パスワード
     */
    static validatePassword(password : string) : boolean
    {
        const len = password.length;

        if (len < 8 || 16 < len)
            return false;

        return true;
    }

    /**
     * ハッシュ化パスワード取得
     *
     * @param   name        ユーザー名
     * @param   password    パスワード
     * @param   salt        ソルト
     *
     * @return  ハッシュ化パスワード
     */
    static getHashPassword(name : string, password : string, salt : string) : string
    {
        const log = slog.stepIn(Utils.CLS_NAME, 'getHashPassword');

        const stretchingCount = 10000;
        let hash : crypt.Hash;
        let p = password;

        for (let i = 0; i < stretchingCount; i++)
        {
            hash = crypt.createHash('sha256');
            hash.update(name + salt + p);

            p = hash.digest(i < stretchingCount - 1 ? 'hex' : 'base64');
        }

        log.stepOut();
        return p;
    }

    /**
     * ランダムテキスト生成
     *
     * @param   size        サイズ
     * @param   numberOnly  数字だけを使うかどうか
     *
     * @return  ランダムテキスト
     */
    static createRundomText(size : number, numberOnly = false) : string
    {
        const chars = (numberOnly
            ? '0123456789'
            : '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

        const len = chars.length;
        let text = '';

        for (let i= 0; i < size; i++)
            text += chars[random.integer(0, len - 1)];

        return text;
    }

    /**
     * URL生成
     *
     * @param   apiName API名
     * @param   id      ID
     *
     * @return  URL
     */
    static generateUrl(path : string, id? : string) : string
    {
        let url;

        const protocol = (Config.hasSSL() ? 'https' : 'http');
        const host = Config.APP_HOST;
        const port = Config.APP_PORT;
        const isDefaultPort = (port === 80 || port === 443);

        if (isDefaultPort) url = `${protocol}://${host}/${path}`;
        else               url = `${protocol}://${host}:${port}/${path}`;

        if (id)
            url += `?id=${id}`;

        return url;
    }

    /**
     * メールを送信する
     *
     * @param   subject     件名
     * @param   toAddr      送信先メールアドレス
     * @param   contents    本文
     *
     * @return  送信成功時はtrue
     */
    static sendMail(subject : string, toAddr : string, contents : string) : Promise<boolean>
    {
        return new Promise((resolve : BooleanResolve) =>
        {
            const log = slog.stepIn(Utils.CLS_NAME, 'sendMail');
            const smtpOptions : smtp.SmtpOptions =
            {
                host: Config.SMTP_HOST,
                port: Config.SMTP_PORT,
                auth:
                {
                    user: Config.SMTP_USER,
                    pass: Config.SMTP_PASSWORD
                }
            };
            const transport = smtp(smtpOptions);
            const transporter = mailer.createTransport(transport);
            const mailOptions : mailer.SendMailOptions =
            {
                from:    Config.SMTP_FROM,
                to:      toAddr,
                subject: subject,
                text:    contents
            };

            transporter.sendMail(mailOptions, function (err : Error, response : mailer.SentMessageInfo)
            {
                if (err)
                    log.w(err.message);

                log.stepOut();
                resolve(err === null);
            });
        });
    }

    /**
     * オブジェクトをコピーする
     *
     * @param   dst コピー先
     * @param   src コピー元
     */
    static copy(dst, src) : void
    {
        for (const key in dst)
        {
            if (key in src)
                dst[key] = src[key];
        }
    }

    /**
     * 文字列フォーマット<br>
     * 使用方法: formatString('Hello ${name} !', {name:'Taro'});
     *
     * @param   format  フォーマット
     * @param   args    引数
     *
     * @return  文字列
     */
    static formatString(format : string, args : Object) : string
    {
        return format.replace(/\${(.*?)}/g, (match, key) =>
        {
            return (key in args ? args[key] : match);
        });
    }

    /**
     * accept-languageからからロケールを取得する
     *
     * @return  言語
     */
    static getLocale(req : express.Request) : string
    {
        const {headers} = req;
        let locale = 'en';

        if ('accept-language' in headers)
            locale = headers['accept-language'].substr(0, 2);

        if (locale !== 'ja')
            locale = 'en';

        return locale;
    }
}
