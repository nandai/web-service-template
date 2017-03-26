/**
 * (C) 2016-2017 printf.jp
 */
import View  from './view';
import Api   from '../utils/api';
import R     from '../utils/r';
import Utils from '../utils/utils';

const sulas = window['sulas'];
const slog =  window['slog'];

/**
 * View
 */
class SettingsView extends View
{
    private static CLS_NAME = 'SettingsView';

    private twitterButton;
    private facebookButton;
    private googleButton;
    private emailButton;
    private passwordButton;
    private accountButton;
    private leaveButton;
    private backButton;

    private account;

    /**
     * 初期化
     */
    protected async init(isResize : boolean)
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'init');

        this.twitterButton =  new sulas.Button('#twitter',  0, 50, '');
        this.facebookButton = new sulas.Button('#facebook', 0, 50, '');
        this.googleButton =   new sulas.Button('#google',   0, 50, '');
        this.emailButton =    new sulas.Button('#email',    0, 50, R.text(R.GO_EMAIL_SETTINGS));
        this.passwordButton = new sulas.Button('#password', 0, 50, R.text(R.GO_PASSWORD_SETTINGS));
        this.accountButton =  new sulas.Button('#account',  0, 50, R.text(R.GO_ACCOUNT_SETTINGS));
        this.leaveButton =    new sulas.Button('#leave',    0, 50, R.text(R.DELETE_ACCOUNT));
        this.backButton =     new sulas.Button('#back',     0, 50, R.text(R.BACK));

        this.twitterButton. on('click', this.onClickTwitterButton. bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.  on('click', this.onClickGoogleButton.  bind(this));
        this.emailButton.   on('click', this.onClickEmailButton.   bind(this));
        this.passwordButton.on('click', this.onClickPasswordButton.bind(this));
        this.accountButton. on('click', this.onClickAccountButton. bind(this));
        this.leaveButton.   on('click', this.onClickLeaveButton.   bind(this));
        this.backButton.    on('click', this.onClickBackButton.    bind(this));

        try
        {
            const account = await Api.getAccount();

            this.account = account;
            $('#name').text(this.account.name);

            this.updateSnsButtons();

            if (this.account.email === null)
                this.passwordButton.setEnabled(false);

            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    private updateSnsButtons()
    {
        this.twitterButton. setLabel(this.getLinkLabel('Twitter',  'twitter'));
        this.facebookButton.setLabel(this.getLinkLabel('Facebook', 'facebook'));
        this.googleButton.  setLabel(this.getLinkLabel('Google',   'google'));
    }

    private getLinkLabel(provider : string, key : string) : string
    {
        const format = R.text(this.account[key]
            ? R.UNLINK_PROVIDER
            : R.LINK_PROVIDER);
        return Utils.formatString(format, {provider});
    }

    /**
     * @method  onClickTwitterButton
     */
    private async onClickTwitterButton()
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickTwitterButton');

        if (this.account.twitter === false)
            location.href = '/settings/account/link/twitter';
        else
            await this.unlink('twitter');

        log.stepOut();
    }

    /**
     * @method  onClickFacebookButton
     */
    private async onClickFacebookButton()
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickFacebookButton');

        if (this.account.facebook === false)
            location.href = '/settings/account/link/facebook';
        else
            await this.unlink('facebook');

        log.stepOut();
    }

    /**
     * @method  onClickGoogleButton
     */
    private async onClickGoogleButton()
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickGoogleButton');

        if (this.account.google === false)
            location.href = '/settings/account/link/google';
        else
            await this.unlink('google');

        log.stepOut();
    }

    /**
     * @method  onClickEmailButton
     */
    private onClickEmailButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickEmailButton');
        window.location.href = '/settings/account/email';
        log.stepOut();
    }

    /**
     * @method  onClickPasswordButton
     */
    private onClickPasswordButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickPasswordButton');
        window.location.href = '/settings/account/password';
        log.stepOut();
    }

    /**
     * @method  onClickAccountButton
     */
    private onClickAccountButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickAccountButton');
        window.location.href = '/settings/account';
        log.stepOut();
    }

    /**
     * @method  onClickLeaveButton
     */
    private async onClickLeaveButton()
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickLeaveButton');
        try
        {
            const message = await Api.deleteAccount();

            if (message === null)
            {
                location.href = '/';
            }
            else
            {
                $('#message').text(message);
            }

            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    /**
     * @method  onClickBackButton
     */
    private onClickBackButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickBackButton');
        window.location.href = '/';
        log.stepOut();
    }

    /**
     * @method  unlink
     */
    private unlink(sns : string)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsView.CLS_NAME, 'unlink');
            try
            {
                const message = await Api.unlink(sns);

                if (message === null)
                {
                    this.account[sns] = false;
                    this.updateSnsButtons();
                }
                else
                {
                    $('#message').text(message);
                }

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                log.stepOut();
                reject();
            }
        });
    }
}

window.addEventListener('load', () => new SettingsView(), false);

if (window.location.hash === '#_=_')
    window.history.pushState('', document.title, window.location.pathname);
