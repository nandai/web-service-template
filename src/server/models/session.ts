/**
 * (C) 2016-2017 printf.jp
 */

/**
 * セッション
 */
export interface Session
{
    id?         : string;
    account_id? : number;
    command_id? : string;
    message_id? : string;
    sms_id?     : string;
    sms_code?   : string;
    authy_uuid? : string;
    created_at? : string;
    updated_at? : string;
}
