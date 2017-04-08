/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import Button        from 'client/components/common/button';
import Input         from 'client/components/common/input';
import R             from 'client/libs/r';
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
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Button onClick={store.onTwitter} >{R.text(R.SIGNUP_WITH_TWITTER)}</Button>
                <Button onClick={store.onFacebook}>{R.text(R.SIGNUP_WITH_FACEBOOK)}</Button>
                <Button onClick={store.onGoogle}  >{R.text(R.SIGNUP_WITH_GOOGLE)}</Button>
                <Input type="text"     placeholder={R.text(R.EMAIL)}    value={store.email}    onChange={store.onEmailChange} />
                <Input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onSignup}  >{R.text(R.SIGNUP)}</Button>
                <Button onClick={store.onTop}     >{R.text(R.GO_TOP)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
