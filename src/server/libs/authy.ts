/**
 * (C) 2016-2017 printf.jp
 */
import Config from '../config';

import slog = require('../slog');

/**
 * Authy
 */
export default class Authy
{
    private static CLS_NAME = 'Authy';
    private static authy = null;

    /**
     * 初期化
     */
    static init()
    {
        Authy.authy = require('authy')(Config.AUTHY_API_KEY);
    }

    /**
     * ユーザー登録
     */
    static registerUser(email : string, phoneNo : string)
    {
        return new Promise((resolve : (authyId : number) => void, reject) =>
        {
            const log = slog.stepIn(Authy.CLS_NAME, 'registerUser');
            Authy.authy.register_user(email, phoneNo, '81', (err, response) =>
            {
                let authyId : number = null;
                if (err)
                {
                    log.w(JSON.stringify(err, null, 2));
                }
                else
                {
                    log.d(JSON.stringify(response, null, 2));
                    authyId = response.user.id;
                }
                log.stepOut();
                resolve(authyId);
            });
        });
    }

    /**
     * ユーザー削除
     */
    static deleteUser(authyId : number)
    {
        return new Promise((resolve : (result : boolean) => void, reject) =>
        {
            const log = slog.stepIn(Authy.CLS_NAME, 'deleteUser');
            Authy.authy.delete_user(authyId, (err, response) =>
            {
                let result = false;
                if (err)
                {
                    log.w(JSON.stringify(err, null, 2));
                }
                else
                {
                    log.d(JSON.stringify(response, null, 2));
                    result = response.success;
                }
                log.stepOut();
                resolve(result);
            });
        });
    }

    /**
     * 検証
     */
    static verify(authyId : number, token : number)
    {
        return new Promise((resolve : (result : boolean) => void, reject) =>
        {
            const log = slog.stepIn(Authy.CLS_NAME, 'verify');
            Authy.authy.verify(authyId, token, (err, response) =>
            {
                let result = false;
                if (err)
                {
                    log.w(JSON.stringify(err, null, 2));
                }
                else
                {
                    log.d(JSON.stringify(response, null, 2));
                    result = (response.success === 'true');
                }
                log.stepOut();
                resolve(result);
            });
        });
    }
}
