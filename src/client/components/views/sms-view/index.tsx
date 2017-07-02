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
import {Store}       from './store';

interface SmsViewProps
{
    store : Store;
}

export default class SmsView extends React.Component<SmsViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const response = store.loginSmsResponse;
        const {message} = response;

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <form>
                        <Input type="number" placeholder={R.text(R.LOGIN_CODE, locale)} value={store.smsCode} message={message.smsCode} onChange={store.onSmsCodeChange} />
                        <Button submit={true} onClick={store.onSend}>{R.text(R.SEND, locale)}</Button>
                        <Text>{store.message}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
