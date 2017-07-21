/**
 * (C) 2016-2017 printf.jp
 */
// import ProviderApi             from '../provider-api';
import {onConfirmSignupEmail}  from './methods/onConfirmSignupEmail';
import {onJoin}                from './methods/onJoin';
import {onSignupEmail}         from './methods/onSignupEmail';

// import express = require('express');

/**
 * サインアップAPI
 */
export default class SignupApi// extends ProviderApi
{
    static onConfirmSignupEmail = onConfirmSignupEmail;
    static onJoin =               onJoin;
    static onSignupEmail =        onSignupEmail;

    /**
     * サインアップする<br>
     * POST /api/signup/:provider<br>
     */
    // TODO:delete
    // static onSignupProvider(req : express.Request, res : express.Response)
    // {
    //     ProviderApi.provider(req, res, 'signup');
    // }
}
