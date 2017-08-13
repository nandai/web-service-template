/**
 * (C) 2016-2017 printf.jp
 */
import {getAccount}           from './methods/getAccount';
import {onChangeEmail}        from './methods/onChangeEmail';
import {onChangePassword}     from './methods/onChangePassword';
import {onCheckUserName}      from './methods/onCheckUserName';
import {onDeleteAccount}      from './methods/onDeleteAccount';
import {onGetAccount}         from './methods/onGetAccount';
import {onInvite}             from './methods/onInvite';
import {onRequestChangeEmail} from './methods/onRequestChangeEmail';
import {onSetAccount}         from './methods/onSetAccount';
import {onUnlinkProvider}     from './methods/onUnlinkProvider';

/**
 * 設定API
 */
export default class SettingsApi
{
    static getAccount =           getAccount;
    static onChangeEmail =        onChangeEmail;
    static onChangePassword =     onChangePassword;
    static onCheckUserName =      onCheckUserName;
    static onDeleteAccount =      onDeleteAccount;
    static onGetAccount =         onGetAccount;
    static onInvite =             onInvite;
    static onRequestChangeEmail = onRequestChangeEmail;
    static onSetAccount =         onSetAccount;
    static onUnlinkProvider =     onUnlinkProvider;
}
