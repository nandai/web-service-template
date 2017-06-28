/**
 * (C) 2016-2017 printf.jp
 */
export namespace Response
{
    export interface Account
    {
        name          : string;
        userName      : string;
        email         : string;
        countryCode   : string;
        phoneNo       : string;
        twoFactorAuth : string;
        twitter       : boolean;
        facebook      : boolean;
        google        : boolean;
        github        : boolean;
        loginDt       : string;
    }

    export interface User
    {
        id          : number;
        accountName : string;
        name        : string;
    }

    export interface ChangeEmail
    {
        status  : Status;
        message : {
            password? : string;
            general?  : string;
        };
    }

    export interface ChangePassword
    {
        status  : Status;
        message : {
            oldPassword? : string;
            newPassword? : string;
            confirm?     : string;
            general?     : string;
        };
    }

    export interface CheckUserName
    {
        status  : Status;
        message : string;
    }

    export interface ConfirmSignupEmail
    {
        status  : Status;
        message : string;
    }

    export interface DeleteAccount
    {
        status   : Status;
        message? : string;
    }

    export interface GetAccount
    {
        status  : Status;
        account : Account;
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

    export interface Invite
    {
        status  : Status;
        message : {
            email?   : string;
            success? : string;
        };
    }

    export interface Join
    {
        status  : Status;
        message : string;
    }

    export interface LoginAuthyOneTouch
    {
        status   : Status;
        approval : boolean;
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

    export interface RequestChangeEmail
    {
        status  : Status;
        message : {
            email?   : string;
            success? : string;
        };
    }

    export interface RequestResetPassword
    {
        status  : Status;
        message : {
            email?   : string;
            success? : string;
        };
    }

    export interface ResetPassword
    {
        status  : Status;
        message : {
            password? : string;
            confirm?  : string;
            general?  : string;
        };
    }

    export interface SetAccount
    {
        status   : Status;
        account? : Account;
        message  : {
            name?        : string;
            userName?    : string;
            countryCode? : string;
            phoneNo?     : string;
            success?     : string;
        };
    }

    export interface SignupEmail
    {
        status  : Status;
        message : {
            email?    : string;
            password? : string;
            success?  : string;
        };
    }

    export interface UnlinkProvider
    {
        status   : Status;
        message? : string;
    }

    export enum Status
    {
        BAD_REQUEST = -1,
        OK =           0,
        FAILED =       1
    }
}
