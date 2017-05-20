/**
 * (C) 2016-2017 printf.jp
 */
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * ユーザーAPI
 */
export default class UserApi
{
    private static CLS_NAME = 'UserApi';

    /**
     * ユーザー取得<br>
     * GET /api/user
     */
    static async onGetUser(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UserApi.CLS_NAME, 'onGetUser');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.GetUser = req.query;
                const condition : Request.GetUser =
                {
                    id: ['number', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const data = await UserApi.getUser(param, req);
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * ユーザー取得
     */
    static getUser(param : Request.GetUser, req : express.Request)
    {
        return new Promise(async (resolve : (data : Response.GetUser) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME, 'getUser');
            try
            {
                const locale = req.ext.locale;
                const data : Response.GetUser = {};
                const id = <number>param.id;
                const account = await AccountModel.find(id);

                if (account === null)
                {
                    data.status = 1;
                    data.message = R.text(R.NOT_FOUND, locale);
                }
                else
                {
                    data.status = 0;
                    data.user = {id:account.id, name:account.name}
                }

                log.stepOut();
                resolve(data);
            }
            catch (err) {log.stepOut(); reject(err)};
        });
    }

    /**
     * ユーザー一覧取得<br>
     * GET /api/users
     */
    static async onGetUserList(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UserApi.CLS_NAME, 'onGetUserList');
        try
        {
            const data = await UserApi.getUserList();
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * ユーザー一覧取得
     */
    static getUserList()
    {
        return new Promise(async (resolve : (data : Response.GetUserList) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME, 'getUserList');
            try
            {
                const accountList = await AccountModel.findList({registered:true});
                const userList = accountList.map(account =>
                {
                    const user : Response.User = {id:account.id, name:account.name};
                    return user;
                });

                const data : Response.GetUserList =
                {
                    status:   0,
                    userList: userList
                }

                log.stepOut();
                resolve(data);
            }
            catch (err) {log.stepOut(); reject(err)};
        });
    }
}
