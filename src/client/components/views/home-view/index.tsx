/**
 * (C) 2016-2017 printf.jp
 */
import * as React      from 'react';

import Apps            from 'client/app/apps';
import Tabs, {TabItem} from 'client/components/common/tabs';
import Footer          from 'client/components/designated/footer';
import Header          from 'client/components/designated/header';
import ViewContainer   from 'client/components/views/view-container';
import {storeNS}       from './store';

interface HomeViewProps
{
    store : storeNS.Store;
    apps  : Apps;
}

export default class HomeView extends React.Component<HomeViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store, apps} = this.props;
        const items : TabItem[] =
        [
            {name:'login',  label:'LOGIN',  onClick:store.onLogin},
            {name:'signup', label:'SIGNUP', onClick:store.onSignup},
            {name:'about',  label:'ABOUT',  onClick:store.onAbout}
        ];

        const page = apps.getPage();

        return (
            <ViewContainer store={store}>
                <Header    store={store} />
                <div style={{position:'relative', flexGrow:1}}>
                    {page.elements}
                </div>
                <Footer>
                    <Tabs active={store.name} items={items} />
                </Footer>
            </ViewContainer>
        );
    }
}
