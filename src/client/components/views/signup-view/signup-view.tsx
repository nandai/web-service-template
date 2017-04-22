/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import Main       from 'client/components/designated/main';
import R          from 'client/libs/r';
import {Store}    from './store';

interface SignupViewProps
{
    store : Store;
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

        return (
            <Main>
                <Button onClick={store.onTwitter} >{R.text(R.SIGNUP_WITH_TWITTER,  locale)}</Button>
                <Button onClick={store.onFacebook}>{R.text(R.SIGNUP_WITH_FACEBOOK, locale)}</Button>
                <Button onClick={store.onGoogle}  >{R.text(R.SIGNUP_WITH_GOOGLE,   locale)}</Button>
                <Input type="text"     placeholder={R.text(R.EMAIL,    locale)} value={store.email}    onChange={store.onEmailChange} />
                <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onSignup}  >{R.text(R.SIGNUP,   locale)}</Button>
                <Button onClick={store.onTop}     >{R.text(R.GO_TOP,   locale)}</Button>
                <span>{store.message}</span>
            </Main>
        );
    }
}
