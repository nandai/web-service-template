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
import {Response}      from 'libs/response';
import {storeNS}       from './store';

interface LoginViewProps
{
    store : storeNS.Store;
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
        const response = store.loginEmailResponse;
        const {message} = response;

        const items : TabItem[] =
        [
            {name:'home',  label:'HOME',  onClick:store.onHome},
            {name:'about', label:'ABOUT', onClick:store.onAbout}
        ];

        const home = (
            <div style={{display:(store.name === 'home' ? 'flex' : 'none'), flexGrow:1}}>
                <ViewContents>
                    <form>
                        <Button onClick={store.onTwitter} >{R.text(R.LOGIN_WITH_TWITTER,  locale)}</Button>
                        <Button onClick={store.onFacebook}>{R.text(R.LOGIN_WITH_FACEBOOK, locale)}</Button>
                        <Button onClick={store.onGoogle}  >{R.text(R.LOGIN_WITH_GOOGLE,   locale)}</Button>
                        <Button onClick={store.onGithub}  >{R.text(R.LOGIN_WITH_GITHUB,   locale)}</Button>
                        <Input type="email"    placeholder={R.text(R.EMAIL,    locale)} value={store.email}    onChange={store.onEmailChange} isMarginTop={true} />
                        <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                        <Button submit={true} onClick={store.onLogin} >{R.text(R.LOGIN, locale)}</Button>
                        <Button url="/signup" onClick={store.onSignup}>{R.text(R.GO_SIGNUP, locale)}</Button>
                        <Button url="/forget" onClick={store.onForget}>{R.text(R.GO_FORGET, locale)}</Button>
                        <Button url="/users"  onClick={store.onUsers} >{R.text(R.USER_LIST, locale)}</Button>
                        <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
                    </form>
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
            <ViewContainer active={store.active}>
                <Header store={store} />
                {home}
                {about}
                <Footer>
                    <Tabs active={store.name} items={items} />
                </Footer>
            </ViewContainer>
        );
    }
}
