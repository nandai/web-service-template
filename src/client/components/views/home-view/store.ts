/**
 * (C) 2016-2017 printf.jp
 */
import {BaseStore, initBaseStore}   from '../base-store';
import {storeNS as forgetStoreNS}   from '../forget-view/store';
import {storeNS as homeTabsStoreNS} from '../home-tabs-view/store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        homeTabsStore? : homeTabsStoreNS.Store;
        forgetStore?   : forgetStoreNS.Store;
    }

    export function init(src : Store) : Store
    {
        const homeTabsStore = homeTabsStoreNS.init(src.homeTabsStore || {});
        initBaseStore(homeTabsStore, src);

        const forgetStore = forgetStoreNS.init(src.forgetStore || {});
        initBaseStore(forgetStore, src);

        const store : Store =
        {
            page: {effect:'fade'},

            homeTabsStore,
            forgetStore
        };
        initBaseStore(store, src);

        return store;
    }
}
