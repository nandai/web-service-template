/**
 * (C) 2016-2017 printf.jp
 */
import Utils         from 'server/libs/utils';
import {Account}     from 'server/models/account';
import {accountName} from './methods/accountName';
import {email}       from './methods/email';
import {password}    from './methods/password';
import {userName}    from './methods/userName';

export default class Validator
{
    static accountName = accountName;
    static email =       email;
    static password =    password;
    static userName =    userName;
}
