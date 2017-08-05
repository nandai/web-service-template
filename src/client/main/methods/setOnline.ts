/**
 * (C) 2016-2017 printf.jp
 */
import {Data} from './data';

/**
 * 各appのstoreにオンライン設定
 */
export function setOnline(data : Data, online : boolean) : void
{
    data.routes.forEach((route) =>
    {
        const store = route.app.store;
        store.online = online;
    });
}
