/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    account    : any;
    message    : string;
    onTwitter  : () => void;
    onFacebook : () => void;
    onGoogle   : () => void;
    onEmail    : () => void;
    onPassword : () => void;
    onAccount  : () => void;
    onLeave    : () => void;
    onBack     : () => void;
}
