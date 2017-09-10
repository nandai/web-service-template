/**
 * (C) 2016-2017 printf.jp
 */
import * as React      from 'react';

import Tabs, {TabItem} from 'client/components/common/tabs';
import Footer          from 'client/components/designated/footer';
import ViewContainer   from 'client/components/views/view-container';
import PageTransition  from 'client/libs/page-transition';
import {storeNS}       from './store';

interface HomeTabsViewProps
{
    store          : storeNS.Store;
    pageTransition : PageTransition;
}

export class HomeTabsView extends React.Component<HomeTabsViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store, pageTransition} = this.props;
        const items : TabItem[] =
        [
            {name:'/',       label:'LOGIN',  url:'/',       onClick:store.onLogin},
            {name:'/signup', label:'SIGNUP', url:'/signup', onClick:store.onSignup},
            {name:'/about',  label:'ABOUT',  url:'/about',  onClick:store.onAbout}
        ];

        const page = pageTransition.getPage();

        return (
            <ViewContainer page={store.page}>
                <div style={{position:'relative', flexGrow:1}}>
                    {page.elements}
                </div>
                <Footer>
                    <Tabs active={store.currentUrl} items={items} />
                </Footer>
            </ViewContainer>
        );
    }
}
