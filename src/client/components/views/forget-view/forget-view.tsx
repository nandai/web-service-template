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

interface ForgetViewProps
{
    store : Store;
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

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <Input type="text" placeholder={R.text(R.EMAIL,     locale)} value={store.email} onChange={store.onEmailChange} />
                    <Button onClick={store.onSend}>{R.text(R.SEND_MAIL, locale)}</Button>
                    <Text>{store.message}</Text>
                </ViewContents>
            </ViewContainer>
        );
    }
}
