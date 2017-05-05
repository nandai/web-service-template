/**
 * (C) 2016-2017 printf.jp
 */
import * as React      from 'react';
import Button          from 'client/components/common/button';
import Input           from 'client/components/common/input';
import Tabs, {TabItem} from 'client/components/common/tabs';
import Text            from 'client/components/common/text';
import Footer          from 'client/components/designated/footer';
import Header          from 'client/components/designated/header';
import ViewContainer   from 'client/components/views/view-container';
import ViewContents    from 'client/components/views/view-contents';
import R               from 'client/libs/r';
import {Store}         from './store';

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

        const items : TabItem[] =
        [
            {name:'home',  label:'HOME',  onClick:store.onHome},
            {name:'about', label:'ABOUT', onClick:store.onAbout}
        ];

        const home = (
            <div style={{display:(store.name === 'home' ? 'flex' : 'none'), flexGrow:1}}>
                <ViewContents>
                    <Button onClick={store.onTwitter} >{R.text(R.LOGIN_WITH_TWITTER,  locale)}</Button>
                    <Button onClick={store.onFacebook}>{R.text(R.LOGIN_WITH_FACEBOOK, locale)}</Button>
                    <Button onClick={store.onGoogle}  >{R.text(R.LOGIN_WITH_GOOGLE,   locale)}</Button>
                    <Input type="email"    placeholder={R.text(R.EMAIL,    locale)} value={store.email}    onChange={store.onEmailChange} />
                    <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                    <Button onClick={store.onLogin}   >{R.text(R.LOGIN,    locale)}</Button>
                    <Button onClick={store.onSignup} url="/signup">{R.text(R.GO_SIGNUP, locale)}</Button>
                    <Button onClick={store.onForget} url="/forget">{R.text(R.GO_FORGET, locale)}</Button>
                    <Button onClick={store.onUsers}  url="/users" >{R.text(R.USER_LIST, locale)}</Button>
                    <Text>{store.message}</Text>
                </ViewContents>
            </div>
        );

        const about = (
            <div style={{display:(store.name === 'about' ? 'flex' : 'none'), flexGrow:1}}>
                <ViewContents>
                    <p style={{textAlign:'center'}}>
                        <a href="https://github.com/nandai/web-service-template" target="_blank">https://github.com/nandai/web-service-template</a>
                    </p>
                </ViewContents>
            </div>
        );

        return (
            <ViewContainer>
                <Header />
                {home}
                {about}
                <Footer>
                    <Tabs active={store.name} items={items} />
                </Footer>
            </ViewContainer>
        );
    }
}
