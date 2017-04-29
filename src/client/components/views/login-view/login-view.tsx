/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/libs/r';
import {Store}    from './store';

interface LoginViewProps
{
    store : Store;
}

export default class LoginView extends React.Component<LoginViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        return (
            <div>
                <Button onClick={store.onTwitter} >{R.text(R.LOGIN_WITH_TWITTER,  locale)}</Button>
                <Button onClick={store.onFacebook}>{R.text(R.LOGIN_WITH_FACEBOOK, locale)}</Button>
                <Button onClick={store.onGoogle}  >{R.text(R.LOGIN_WITH_GOOGLE,   locale)}</Button>
                <Input type="email"    placeholder={R.text(R.EMAIL,    locale)} value={store.email}    onChange={store.onEmailChange} />
                <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onLogin}   >{R.text(R.LOGIN,    locale)}</Button>
                <Button onClick={store.onSignup} url="/signup">{R.text(R.GO_SIGNUP, locale)}</Button>
                <Button onClick={store.onForget} url="/forget">{R.text(R.GO_FORGET, locale)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
