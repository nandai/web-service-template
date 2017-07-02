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
import {Store}       from './store';

interface SettingsAccountEmailViewProps
{
    store : Store;
}

export default class SettingsAccountEmailView extends React.Component<SettingsAccountEmailViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale, account} = store;
        const response = store.requestChangeEmailResponse;
        const {message} = response;

        const messageEl = (store.loading
            ? <Loading />
            : <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
        );

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <form>
                        <Input type="email" placeholder={R.text(R.EMAIL, locale)} value={account.email} message={message.email} onChange={store.onEmailChange} />
                        <Button submit={true} onClick={store.onChange}>{R.text(R.CHANGE, locale)}</Button>
                        <Button               onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                        {messageEl}
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
