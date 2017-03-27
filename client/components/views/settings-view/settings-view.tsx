/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import R          from 'client/utils/r';
import Utils      from 'client/utils/utils';
import {Store}    from './store';

interface SettingsViewProps
{
    store : Store;
}

export default class SettingsView extends React.Component<SettingsViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        const {account} = store;

        const twitterLabel =  this.getLinkLabel('Twitter',  'twitter');
        const facebookLabel = this.getLinkLabel('Facebook', 'facebook');
        const googleLabel =   this.getLinkLabel('Google',   'google');

        const passwordDisabled = (account.email === null);

        return (
            <div>
                <Button onClick={store.onTwitter} >{twitterLabel}</Button>
                <Button onClick={store.onFacebook}>{facebookLabel}</Button>
                <Button onClick={store.onGoogle}  >{googleLabel}</Button>
                <Button onClick={store.onEmail}   >{R.text(R.GO_EMAIL_SETTINGS)}</Button>
                <Button onClick={store.onPassword} disabled={passwordDisabled}>{R.text(R.GO_PASSWORD_SETTINGS)}</Button>
                <Button onClick={store.onAccount} >{R.text(R.GO_ACCOUNT_SETTINGS)}</Button>
                <Button onClick={store.onLeave}   >{R.text(R.DELETE_ACCOUNT)}</Button>
                <Button onClick={store.onBack}    >{R.text(R.BACK)}</Button>
                <p>{account.name}</p>
                <p>{store.message}</p>
            </div>
        );
    }

    private getLinkLabel(provider : string, key : string) : string
    {
        const format = R.text(this.props.store.account[key]
            ? R.UNLINK_PROVIDER
            : R.LINK_PROVIDER);
        return Utils.formatString(format, {provider});
    }
}
