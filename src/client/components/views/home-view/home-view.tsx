/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Apps          from 'client/app/apps';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import {storeNS}     from './store';

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
        const page = apps.getPage();

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
