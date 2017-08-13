/**
 * (C) 2016-2017 printf.jp
 */
import {getUser}       from './methods/getUser';
import {getUserList}   from './methods/getUserList';
import {onGetUser}     from './methods/onGetUser';
import {onGetUserList} from './methods/onGetUserList';

/**
 * ユーザーAPI
 */
export default class UserApi
{
    static getUser =       getUser;
    static getUserList =   getUserList;
    static onGetUser =     onGetUser;
    static onGetUserList = onGetUserList;
}
