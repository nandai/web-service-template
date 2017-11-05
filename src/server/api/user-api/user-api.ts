/**
 * (C) 2016-2017 printf.jp
 */
import {getUser,
        getUserForGraphQL}       from './methods/getUser';
import {getUserList,
        getUserListForGraphQL}   from './methods/getUserList';
import {onGetUser,
        onGetUserForGraphQL}     from './methods/onGetUser';
import {onGetUserList,
        onGetUserListForGraphQL} from './methods/onGetUserList';

/**
 * ユーザーAPI
 */
export default class UserApi
{
    static getUser =                 getUser;
    static getUserForGraphQL =       getUserForGraphQL;
    static getUserList =             getUserList;
    static getUserListForGraphQL =   getUserListForGraphQL;
    static onGetUser =               onGetUser;
    static onGetUserForGraphQL =     onGetUserForGraphQL;
    static onGetUserList =           onGetUserList;
    static onGetUserListForGraphQL = onGetUserListForGraphQL;
}
