/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Input         from 'client/components/common/input';
import Loading       from 'client/components/common/loading';
import Text          from 'client/components/common/text';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {Response}    from 'libs/response';
import {storeNS}     from './store';

interface SettingsInviteViewProps
{
    store : storeNS.Store;
}

export default class SettingsInviteView extends React.Component<SettingsInviteViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const response = store.inviteResponse;
        const {message} = response;

        const messageEl = (store.loading
            ? <Loading />
            : <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
        );

        const disabled = (store.loading === true);

        return (
            <ViewContainer store={store}>
                <Header store={store} />
                <ViewContents>
                    <form>
                        <Input type="email" placeholder={R.text(R.EMAIL, locale)} value={store.email} message={message.email} onChange={store.onEmailChange} />
                        <Button submit={true} disabled={disabled} onClick={store.onInvite}>{R.text(R.INVITE, locale)}</Button>
                        <Button               disabled={disabled} onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                        {messageEl}
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
