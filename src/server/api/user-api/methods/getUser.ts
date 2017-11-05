/**
 * (C) 2016-2017 printf.jp
 */
import {Request}             from 'libs/request';
import {Response}            from 'libs/response';
import {slog}                from 'libs/slog';
import AccountAgent          from 'server/agents/account-agent';
import Converter             from 'server/libs/converter';
import GraphqlRoot, {schema} from 'server/libs/graphql-root';
import {Account}             from 'server/models/account';

import express = require('express');
import graphql = require('graphql');

/**
 * ユーザー取得
 */
export function getUser(param : Request.GetUser, _req : express.Request)
{
    return new Promise(async (resolve : (data : Response.GetUser) => void, reject) =>
    {
        const log = slog.stepIn('UserApi', 'getUser');
        try
        {
            const data  : Response.GetUser = {status:Response.Status.OK, user:null};
            let account : Account = null;
            const {id} = param;

            if (id)
            {
                if (isNaN(Number(id))) {
                    account = await AccountAgent.findByUserName(id as string);
                } else {
                    account = await AccountAgent.find(Number(id));
                }
            }

            if (account) {
                data.user = Converter.accountToUserResponse(account);
            }

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

export function getUserForGraphQL(param : Request.GetUser)
{
    return new Promise(async (resolve : (data : Response.GetUser) => void, reject) =>
    {
        const log = slog.stepIn('UserApi', 'getUserForGraphQL');
        try
        {
            let args : string;

            if (isNaN(Number(param.id))) {
                args = `name:"${param.id}"`;
            } else {
                args = `id:${param.id}`;
            }

            const result = await graphql.graphql(schema, `query {user(${args}) {id, accountName, name}}`, GraphqlRoot);
            const data = result.data as Response.GetUser;

//          log.d(JSON.stringify(data, null, 2));
            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
