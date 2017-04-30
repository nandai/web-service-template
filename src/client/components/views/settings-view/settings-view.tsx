/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import R          from 'client/libs/r';
import Utils      from 'client/libs/utils';
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
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale, account} = store;

        const twitterLabel =  this.getLinkLabel('Twitter',  'twitter');
        const facebookLabel = this.getLinkLabel('Facebook', 'facebook');
        const googleLabel =   this.getLinkLabel('Google',   'google');

        const passwordDisabled = (account.email === null);

        return (
            <div className="view">
                <Button onClick={store.onTwitter} >{twitterLabel}</Button>
                <Button onClick={store.onFacebook}>{facebookLabel}</Button>
                <Button onClick={store.onGoogle}  >{googleLabel}</Button>
                <Button onClick={store.onEmail}    url="/settings/account/email">{R.text(R.GO_EMAIL_SETTINGS, locale)}</Button>
                <Button onClick={store.onPassword} url="/settings/account/password" disabled={passwordDisabled}>{R.text(R.GO_PASSWORD_SETTINGS, locale)}</Button>
                <Button onClick={store.onAccount}  url="/settings/account">{R.text(R.GO_ACCOUNT_SETTINGS, locale)}</Button>
                <Button onClick={store.onLeave}   >{R.text(R.DELETE_ACCOUNT, locale)}</Button>
                <Button onClick={store.onBack}    >{R.text(R.BACK, locale)}</Button>
                <p>{account.name}</p>
                <p>{store.message}</p>
            </div>
        );
    }

    private getLinkLabel(provider : string, key : string) : string
    {
        const {store} = this.props;
        const format = R.text(store.account[key]
            ? R.UNLINK_PROVIDER
            : R.LINK_PROVIDER, store.locale);
        return Utils.formatString(format, {provider});
    }
}
