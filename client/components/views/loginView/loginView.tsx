/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import {Store}    from './store';
import R          from '../../../r';

interface LoginViewProps
{
    store : Store;
}

export default class LoginView extends React.Component<LoginViewProps, {}>
{
    private static CLS_NAME = 'LoginView';

    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <button onClick={store.onTwitter} >{R.text(R.LOGIN_WITH_TWITTER)}</button>
                <button onClick={store.onFacebook}>{R.text(R.LOGIN_WITH_FACEBOOK)}</button>
                <button onClick={store.onGoogle}  >{R.text(R.LOGIN_WITH_GOOGLE)}</button>
                <input type="text"     placeholder={R.text(R.EMAIL)}    value={store.email}    onChange={store.onEmailChange} />
                <input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <button onClick={store.onLogin}   >{R.text(R.LOGIN)}</button>
                <button onClick={store.onSignup}  >{R.text(R.GO_SIGNUP)}</button>
                <button onClick={store.onForget}  >{R.text(R.GO_FORGET)}</button>
                <span>{store.message}</span>
            </div>
        );
    }
}
