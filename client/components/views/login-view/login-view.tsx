/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
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
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Button onClick={store.onTwitter} >{R.text(R.LOGIN_WITH_TWITTER)}</Button>
                <Button onClick={store.onFacebook}>{R.text(R.LOGIN_WITH_FACEBOOK)}</Button>
                <Button onClick={store.onGoogle}  >{R.text(R.LOGIN_WITH_GOOGLE)}</Button>
                <Input type="text"     placeholder={R.text(R.EMAIL)}    value={store.email}    onChange={store.onEmailChange} />
                <Input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onLogin}   >{R.text(R.LOGIN)}</Button>
                <Button onClick={store.onSignup}  >{R.text(R.GO_SIGNUP)}</Button>
                <Button onClick={store.onForget}  >{R.text(R.GO_FORGET)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
