/**
 * (C) 2016-2017 printf.jp
 */
import * as React       from 'react';

import Button           from 'client/components/common/button';
import Input            from 'client/components/common/input';
import RadioButtons, {
       RadioButtonItem} from 'client/components/common/radio-buttons';
import Text             from 'client/components/common/text';
import Header           from 'client/components/designated/header';
import ViewContainer    from 'client/components/views/view-container';
import ViewContents     from 'client/components/views/view-contents';
import R                from 'client/libs/r';
import {Store}          from './store';

interface SettingsAccountViewProps
{
    store : Store;
}

export default class SettingsAccountView extends React.Component<SettingsAccountViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale, account} = store;
        const items : RadioButtonItem[] =
        [
            {label:R.text(R.TWO_FACTOR_AUTH_SMS,   locale), value:'SMS'  },
            {label:R.text(R.TWO_FACTOR_AUTH_AUTHY, locale), value:'Authy'},
            {label:R.text(R.TWO_FACTOR_AUTH_NONE,  locale), value:null   }
        ];

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <form>
                        <Input type="text" placeholder={R.text(R.ACCOUNT_NAME, locale)} value={account.name}        onChange={store.onNameChange} />
                        <Input type="text" placeholder={R.text(R.USER_NAME,    locale)} value={account.userName}    onChange={store.onUserNameChange} />
                        <Input type="text" placeholder={R.text(R.PHONE_NO,     locale)} value={account.phoneNo}     onChange={store.onPhoneNoChange} />
                        <Input type="text" placeholder={R.text(R.COUNTRY_CODE, locale)} value={account.countryCode} onChange={store.onCountryCodeChange} />
                        <RadioButtons name="two-factor-auth" items={items} value={account.twoFactorAuth} onClick={store.onTwoFactorAuth} />
                        <Button submit={true} onClick={store.onChange}>{R.text(R.CHANGE, locale)}</Button>
                        <Button               onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                        <Text>{store.message}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
