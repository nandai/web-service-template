/**
 * (C) 2016-2017 printf.jp
 */
export namespace Request
{
    export interface SignupEmail
    {
        email    : string | any[];
        password : string | any[];
    }

    export interface ConfirmSignupEmail
    {
        signupId : string | any[];
        password : string | any[];
    }

    export interface LoginEmail
    {
        email    : string | any[];
        password : string | any[];
    }

    export interface LoginSms
    {
        smsId   : string | any[];
        smsCode : string | any[];
    }

    export interface UnlinkProvider
    {
        provider : string | any[];
    }

    export interface Twitter
    {
        accessToken       : string | any[];
        accessTokenSecret : string | any[];
    }

    export interface Facebook
    {
        accessToken : string | any[];
    }

    export interface Google
    {
        accessToken : string | any[];
    }

    export interface RequestResetPassword
    {
        email : string | any[];
    }

    export interface ResetPassword
    {
        resetId  : string | any[];
        password : string | any[];
        confirm  : string | any[];
    }

    export interface SetAccount
    {
        name          : string | any[];
        countryCode   : string | any[];
        phoneNo       : string | any[];
        twoFactorAuth : string | any[];
    }

    export interface RequestChangeEmail
    {
        email : string | any[];
    }

    export interface ChangeEmail
    {
        changeId : string | any[];
        password : string | any[];
    }

    export interface ChangePassword
    {
        oldPassword : string | any[];
        newPassword : string | any[];
        confirm     : string | any[];
    }

    export interface GetUser
    {
        id : number | any[];
    }
}
