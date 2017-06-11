/**
 * (C) 2016-2017 printf.jp
 */

/**
 * アカウント
 */
export interface Account
{
    id?                     : number;
    name?                   : string;
    user_name?              : string;    // 重複不可
    twitter?                : string;
    facebook?               : string;
    google?                 : string;
    github?                 : string;
    email?                  : string;
    password?               : string;
    country_code?           : string;
    phone_no?               : string;    // 例：03-1234-5678
    international_phone_no? : string;    // 例：81312345678。検索などで使う想定
    authy_id?               : number;
    two_factor_auth?        : string;
    signup_id?              : string;
    invite_id?              : string;
    reset_id?               : string;
    change_id?              : string;
    change_email?           : string;
    crypto_type?            : number;
    created_at?             : string;
    updated_at?             : string;
    deleted_at?             : string;
}
