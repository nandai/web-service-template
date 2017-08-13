/**
 * (C) 2016-2017 printf.jp
 */
import {onRequestResetPassword} from './methods/onRequestResetPassword';
import {onResetPassword}        from './methods/onResetPassword';

/**
 * リセットAPI
 */
export default class ResetApi
{
    static onRequestResetPassword = onRequestResetPassword;
    static onResetPassword =        onResetPassword;
}
