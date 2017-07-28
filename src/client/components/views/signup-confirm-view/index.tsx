/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Input         from 'client/components/common/input';
import Text          from 'client/components/common/text';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {Response}    from 'libs/response';
import {storeNS}     from './store';

interface SignupConfirmViewProps
{
    store : storeNS.Store;
}

export default class SignupConfirmView extends React.Component<SignupConfirmViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const response = store.confirmSignupEmailResponse;
        const {message} = response;

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <form>
                        <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} message={message.password} onChange={store.onPasswordChange} />
                        <Button submit={true} onClick={store.onConfirm}>{R.text(R.SEND, locale)}</Button>
                        <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
