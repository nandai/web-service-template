/**
 * (C) 2016-2017 printf.jp
 */
import AboutApp  from './about-app';
import LoginApp  from './login-app';
import SignupApp from './signup-app';

/**
 * home app
 */
export default class HomeApp
{
    static login =  LoginApp .index;
    static signup = SignupApp.index;
    static about =  AboutApp .index;
}
