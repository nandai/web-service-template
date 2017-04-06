/**
 * (C) 2016-2017 printf.jp
 */
export namespace Response
{
    export interface Account
    {
        name     : string;
        email    : string;
        phoneNo  : string;
        twitter  : boolean;
        facebook : boolean;
        google   : boolean;
    }

    export interface LoginEmail
    {
        status   : number;
        smsId    : string;
        message? : string;
    }

    export interface LoginSms
    {
        status   : number;
        message? : string;
    }

    export interface GetAccount
    {
        status  : number;
        account : Account;
    }

    export interface SetAccount
    {
        status  : number;
        message : string;
    }

    export interface DeleteAccount
    {
        status   : number;
        message? : string;
    }

    export interface UnlinkProvider
    {
        status   : number;
        message? : string;
    }

    export interface RequestChangeEmail
    {
        status  : number;
        message : string;
    }

    export interface ChangeEmail
    {
        status  : number;
        message : string;
    }

    export interface ChangePassword
    {
        status  : number;
        message : string;
    }

    export interface RequestResetPassword
    {
        status  : number;
        message : string;
    }

    export interface ResetPassword
    {
        status  : number;
        message : string;
    }

    export interface SignupEmail
    {
        status  : number;
        message : string;
    }

    export interface ConfirmSignupEmail
    {
        status  : number;
        message : string;
    }
}
