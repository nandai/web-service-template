/**
 * (C) 2016-2017 printf.jp
 */
export namespace Request
{
    export interface SignupEmail
    {
        email    : any;
        password : any;
    }

    export interface ConfirmSignupEmail
    {
        signupId : any;
        password : any;
    }

    export interface LoginEmail
    {
        email    : any;
        password : any;
    }

    export interface LoginSms
    {
        smsId   : any;
        smsCode : any;
    }

    export interface UnlinkProvider
    {
        provider : any;
    }

    export interface Twitter
    {
        accessToken       : any;
        accessTokenSecret : any;
    }

    export interface Facebook
    {
        accessToken : any;
    }

    export interface Google
    {
        accessToken : any;
    }

    export interface RequestResetPassword
    {
        email : any;
    }

    export interface ResetPassword
    {
        resetId  : any;
        password : any;
        confirm  : any;
    }

    export interface SetAccount
    {
        name    : any;
        phoneNo : any;
    }

    export interface RequestChangeEmail
    {
        email : any;
    }

    export interface ChangeEmail
    {
        changeId : any;
        password : any;
    }

    export interface ChangePassword
    {
        oldPassword : any;
        newPassword : any;
        confirm     : any;
    }
}
