/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import {Data}     from './data';

import _ = require('lodash');

/**
 * 各appのstoreにアカウント設定
 */
export function setAccount(data : Data, account : Response.Account) : void
{
    account = account || null;
    data.account = account;

    data.routes.forEach((route) =>
    {
        const {store} = route.app;
        store.prevAccount = store.account;
        store.account = _.clone(account);
    });
}
