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

interface ForgetViewProps
{
    store : storeNS.Store;
}

export default class ForgetView extends React.Component<ForgetViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const response = store.requestResetPasswordResult;
        const {message} = response;

        const messageEl = (store.loading
            ? <Loading />
            : <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
        );

        return (
            <ViewContainer>
                <Header store={store} />
                <ViewContents>
                    <form>
                        <Input type="text" placeholder={R.text(R.EMAIL, locale)} value={store.email} message={message.email} onChange={store.onEmailChange} />
                        <Button submit={true} onClick={store.onSend}>{R.text(R.SEND_MAIL, locale)}</Button>
                        <Button               onClick={store.onBack}>{R.text(R.BACK,      locale)}</Button>
                        {messageEl}
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
