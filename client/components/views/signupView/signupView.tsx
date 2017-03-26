/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SignupViewProps
{
    store : Store;
}

export default class SignupView extends React.Component<SignupViewProps, {}>
{
    private static CLS_NAME = 'SignupView';

    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <button onClick={store.onTwitter} >{R.text(R.SIGNUP_WITH_TWITTER)}</button>
                <button onClick={store.onFacebook}>{R.text(R.SIGNUP_WITH_FACEBOOK)}</button>
                <button onClick={store.onGoogle}  >{R.text(R.SIGNUP_WITH_GOOGLE)}</button>
                <input type="text"     placeholder={R.text(R.EMAIL)}    value={store.email}    onChange={store.onEmailChange} />
                <input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <button onClick={store.onSignup}  >{R.text(R.SIGNUP)}</button>
                <button onClick={store.onTop}     >{R.text(R.GO_TOP)}</button>
                <span>{store.message}</span>
            </div>
        );
    }
}
