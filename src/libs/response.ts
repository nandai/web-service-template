/**
 * (C) 2016-2017 printf.jp
 */
export namespace Response
{
    export interface Account
    {
        name          : string;
        email         : string;
        countryCode   : string;
        phoneNo       : string;
        twoFactorAuth : string;
        twitter       : boolean;
        facebook      : boolean;
        google        : boolean;
    }

    export interface User
    {
        id   : number;
        name : string;
    }

    export interface LoginEmail
    {
        status   : number;
        smsId    : string;
        message? : string;
    }

    export interface LoginSms
    {
        status   : Status;
        message? : string;
    }

    export interface LoginAuthyOneTouch
    {
        status   : Status;
        approval : boolean;
    }

    export interface GetAccount
    {
        status  : Status;
        account : Account;
    }

    export interface SetAccount
    {
        status  : Status;
        message : string;
    }

    export interface DeleteAccount
    {
        status   : Status;
        message? : string;
    }

    export interface UnlinkProvider
    {
        status   : Status;
        message? : string;
    }

    export interface RequestChangeEmail
    {
        status  : Status;
        message : string;
    }

    export interface ChangeEmail
    {
        status  : Status;
        message : string;
    }

    export interface ChangePassword
    {
        status  : Status;
        message : string;
    }

    export interface RequestResetPassword
    {
        status  : Status;
        message : string;
    }

    export interface ResetPassword
    {
        status  : Status;
        message : string;
    }

    export interface SignupEmail
    {
        status  : Status;
        message : string;
    }

    export interface ConfirmSignupEmail
    {
        status  : Status;
        message : string;
    }

    export interface GetUser
    {
        status?  : Status;
        user?    : User;
        message? : string;
    }

    export interface GetUserList
    {
        status   : Status;
        userList : User[];
    }

    export enum Status
    {
        BAD_REQUEST = -1,
        OK =           0,
        FAILED =       1
    }
}
