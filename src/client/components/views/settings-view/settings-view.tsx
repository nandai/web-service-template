/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Modal         from 'client/components/common/modal';
import Text          from 'client/components/common/text';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {Response}    from 'libs/response';
import CommonUtils   from 'libs/utils';
import {storeNS}     from './store';

import moment = require('moment');

interface SettingsViewProps
{
    store : storeNS.Store;
}

export default class SettingsView extends React.Component<SettingsViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;
        const account = store.account || store.prevAccount;

        const response = store.unlinkProviderResponse;
        const {message} = response;

        const twitterLabel =  this.getLinkLabel('Twitter',  'twitter');
        const facebookLabel = this.getLinkLabel('Facebook', 'facebook');
        const googleLabel =   this.getLinkLabel('Google',   'google');
        const githubLabel =   this.getLinkLabel('Github',   'github');

        const passwordDisabled = (account.email === null);

        let loginDt = '';
        if (account.loginDt)
        {
            // UTCからローカルタイムに変換
            const dt = moment(account.loginDt).toDate();
            const m =  moment(dt);

            loginDt = R.text(R.LOGIN_DT, locale) + m.format('YYYY/MM/DD HH:mm:ss');
        }

        return (
            <ViewContainer page={store.page}>
                <Header store={store} />
                <ViewContents>
                    <Button onClick={store.onTwitter} >{twitterLabel}</Button>
                    <Button onClick={store.onFacebook}>{facebookLabel}</Button>
                    <Button onClick={store.onGoogle}  >{googleLabel}</Button>
                    <Button onClick={store.onGithub}  >{githubLabel}</Button>
                    <Button onClick={store.onEmail}    url="/settings/account/email">{R.text(R.GO_EMAIL_SETTINGS, locale)}</Button>
                    <Button onClick={store.onPassword} url="/settings/account/password" disabled={passwordDisabled}>{R.text(R.GO_PASSWORD_SETTINGS, locale)}</Button>
                    <Button onClick={store.onAccount}  url="/settings/account">{R.text(R.GO_ACCOUNT_SETTINGS, locale)}</Button>
                    <Button onClick={store.onLeave}   >{R.text(R.DELETE_ACCOUNT, locale)}</Button>
                    <Button onClick={store.onBack}    >{R.text(R.BACK, locale)}</Button>
                    <Text>{account.name}　{loginDt}</Text>
                    <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
                </ViewContents>
                <Modal locale =   {locale}
                       page =     {store.modalPage}
                       message =  {R.text(R.DOES_DELETE_ACCOUNT, locale)}
                       onOK =     {store.onLeaveOK}
                       onCancel = {store.onCloseModal} />
            </ViewContainer>
        );
    }

    private getLinkLabel(provider : string, key : string) : string
    {
        const {store} = this.props;
        const account = store.account || store.prevAccount;
        const format = R.text(account[key]
            ? R.UNLINK_PROVIDER
            : R.LINK_PROVIDER, store.locale);
        return CommonUtils.formatString(format, {provider});
    }
}
