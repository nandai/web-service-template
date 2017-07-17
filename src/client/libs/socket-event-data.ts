/**
 * (C) 2017 printf.jp
 */
import {Response} from 'libs/response';

export interface SocketEventData
{
    notifyUpdateUser? : Response.User;
    notifyDeleteUser? : {id : number};
}
