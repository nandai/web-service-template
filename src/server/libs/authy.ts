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
        if (Config.AUTHY_API_KEY !== '') {
            Authy.authy = require('authy')(Config.AUTHY_API_KEY);
        }
    }

    /**
     * ユーザー登録
     */
    static registerUser(email : string, countryCode : string, phoneNo : string)
    {
        return new Promise((resolve : (authyId : number) => void, reject) =>
        {
            const log = slog.stepIn(Authy.CLS_NAME, 'registerUser');
            Authy.authy.register_user(email, phoneNo, countryCode, (err, response) =>
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

    /**
     * 承認要求
     */
    static sendApprovalRequest(authyId : number)
    {
        return new Promise((resolve : (uuid : string) => void, reject) =>
        {
            const log = slog.stepIn(Authy.CLS_NAME, 'sendApprovalRequest');
            const payload =
            {
                message: 'Login requested for a web service template account.'
            };

            Authy.send_approval_request(authyId, payload, null, null, (err, response) =>
            {
                let uuid : string = null;
                if (err)
                {
                    log.w(JSON.stringify(err, null, 2));
                }
                else
                {
                    log.d(JSON.stringify(response, null, 2));
                    uuid = response.approval_request.uuid;
                }
                log.stepOut();
                resolve(uuid);
            });
        });
    }

    /**
     * 承認要求
     *
     * npmに登録されているものが最新ではないようで、Authy.authy.send_approval_requestがundefinedとなってしまうため、
     * https://github.com/evilpacket/node-authy/blob/master/index.js から引用。
     */
    private static send_approval_request(authyId : number, user_payload, hidden_details, logos, callback) : void
    {
        const message_parameters =
        {
            'message': user_payload.message,
            'details': user_payload.details || {},
            'hidden_details': hidden_details || {}
        };

        // only add logos if provided
        if (logos) {
            message_parameters['logos'] = logos;
        }

        // only add expiration time if provided
        if (user_payload.seconds_to_expire) {
            message_parameters['seconds_to_expire'] = user_payload.seconds_to_expire;
        }

        const url= `/onetouch/json/users/${authyId}/approval_requests`;
        Authy.authy._request('post', url, message_parameters, callback);
    }

    /**
     * 承認チェック
     */
     static checkApprovalStatus(uuid : string)
     {
         return new Promise((resolve : (result : boolean) => void, reject) =>
         {
             const log = slog.stepIn(Authy.CLS_NAME, 'checkApprovalStatus');
             Authy.check_approval_status(uuid, (err, response) =>
             {
                 let result = false;
                 if (err)
                 {
                     log.w(JSON.stringify(err, null, 2));
                 }
                 else
                 {
                     log.d(JSON.stringify(response, null, 2));
                     result = (response.approval_request.status === 'approved');
                 }
                 log.stepOut();
                 resolve(result);
             });
         });
     }

    /**
     * 承認チェック
     *
     * npmに登録されているものが最新ではないようで、Authy.authy.check_approval_statusがundefinedとなってしまうため、
     * https://github.com/evilpacket/node-authy/blob/master/index.js から引用。
     */
    private static check_approval_status(uuid : string, callback) : void
    {
        const url=`/onetouch/json/approval_requests/${uuid}`;
        Authy.authy._request('get', url, {}, callback);
    }
}
