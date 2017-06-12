/**
 * (C) 2016-2017 printf.jp
 */
export namespace Request
{
    export interface ChangeEmail
    {
        changeId : string;
        password : string;
    }

    export interface ChangePassword
    {
        oldPassword : string;
        newPassword : string;
        confirm     : string;
    }

    export interface CheckUserName
    {
        userName : string;
    }

    export interface ConfirmSignupEmail
    {
        signupId : string;
        password : string;
    }

    export interface Facebook
    {
        accessToken : string;
    }

    export interface GetUser
    {
        id : string;
    }

    export interface Github
    {
        accessToken : string;
    }

    export interface Google
    {
        accessToken : string;
    }

    export interface Invite
    {
        email : string;
    }

    export interface Join
    {
        inviteId : string;
        password : string;
    }

    export interface LoginEmail
    {
        email    : string;
        password : string;
    }

    export interface LoginSms
    {
        smsId   : string;
        smsCode : string;
    }

    export interface RequestChangeEmail
    {
        email : string;
    }

    export interface RequestResetPassword
    {
        email : string;
    }

    export interface ResetPassword
    {
        resetId  : string;
        password : string;
        confirm  : string;
    }

    export interface SetAccount
    {
        name          : string;
        userName      : string;
        countryCode   : string;
        phoneNo       : string;
        twoFactorAuth : string;
    }

    export interface SignupEmail
    {
        email    : string;
        password : string;
    }

    export interface Twitter
    {
        accessToken       : string;
        accessTokenSecret : string;
    }

    export interface UnlinkProvider
    {
        provider : string;
    }
}
