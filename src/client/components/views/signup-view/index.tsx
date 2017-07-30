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

interface SignupViewProps
{
    store : storeNS.Store;
}

export default class SignupView extends React.Component<SignupViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const response = store.signupEmailResponse;
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
                        <Button onClick={store.onTwitter} >{R.text(R.SIGNUP_WITH_TWITTER,  locale)}</Button>
                        <Button onClick={store.onFacebook}>{R.text(R.SIGNUP_WITH_FACEBOOK, locale)}</Button>
                        <Button onClick={store.onGoogle}  >{R.text(R.SIGNUP_WITH_GOOGLE,   locale)}</Button>
                        <Button onClick={store.onGithub}  >{R.text(R.SIGNUP_WITH_GITHUB,   locale)}</Button>
                        <Input type="text"     placeholder={R.text(R.EMAIL,    locale)} value={store.email}    message={message.email}    onChange={store.onEmailChange} isMarginTop={true} />
                        <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} message={message.password} onChange={store.onPasswordChange} />
                        <Button submit={true} disabled={disabled} onClick={store.onSignup}>{R.text(R.SIGNUP, locale)}</Button>
                        <Button               disabled={disabled} onClick={store.onTop}   >{R.text(R.GO_TOP, locale)}</Button>
                        {messageEl}
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
