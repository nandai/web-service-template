/**
 * (C) 2016-2017 printf.jp
 */
// import ProviderApi            from '../provider-api';
import {onLoginAuthyOneTouch} from './methods/onLoginAuthyOneTouch';
import {onLoginEmail}         from './methods/onLoginEmail';
import {onLoginSms}           from './methods/onLoginSms';

import express = require('express');

/**
 * ログインAPI
 */
export default class LoginApi// extends ProviderApi
{
    static onLoginAuthyOneTouch = onLoginAuthyOneTouch;
    static onLoginEmail =         onLoginEmail;
    static onLoginSms =           onLoginSms;

    /**
     * ログインする<br>
     * POST /api/login/:provider
     */
    // TODO:delete
    // static onLoginProvider(req : express.Request, res : express.Response)
    // {
    //     ProviderApi.provider(req, res, 'login');
    // }
}
