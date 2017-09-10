/**
 * (C) 2016-2017 printf.jp
 */
import * as React     from 'react';

import Header         from 'client/components/designated/header';
import ViewContainer  from 'client/components/views/view-container';
import PageTransition from 'client/libs/page-transition';
import {storeNS}      from './store';

interface HomeViewProps
{
    store          : storeNS.Store;
    pageTransition : PageTransition;
}

export default class HomeView extends React.Component<HomeViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store, pageTransition} = this.props;
        const page = pageTransition.getPage();

        return (
            <ViewContainer page={store.page}>
                <Header store={store} />
                <div style={{position:'relative', flexGrow:1}}>
                    {page.elements}
                </div>
            </ViewContainer>
        );
    }
}
