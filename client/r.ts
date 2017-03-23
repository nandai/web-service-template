/**
 * (C) 2016 printf.jp
 */

/**
 * リソース
 */
export default class R
{
    private static path = __dirname + '/../../resources';

    private static texts =
    {
        'en':
        {
            'signupWithTwitter':  'Sign up with Twitter',
            'signupWithFacebook': 'Sign up with Facebook',
            'signupWithGoogle':   'Sign up with Google',
            'loginWithTwitter':   'Log in with Twitter',
            'loginWithFacebook':  'Log in with Facebook',
            'loginWithGoogle':    'Log in with Google',
            'email':              'Email',
            'password':           'Password',
            'signup':             'Sign up',
            'login':              'Log in',
            'logout':             'Log out',
            'goTop':              'Go top',
            'goSignup':           'Go sign up',
            'goForget':           'Go forget',
            'goSettings':         'Go settings',
            'goEmailSettings':    'Go email settings',
            'goPasswordSettings': 'Go password settings',
            'goAccountSettings':  'Go account settings',
            'back':               'Back',
            'send':               'Send',
            'sendMail':           'Send mail',
            'deleteAccount':      'Delete account',
            'linkProvider':       'Link ${provider}',
            'unlinkProvider':     'Unlink ${provider}',
            'change':             'Change',
            'currentPassword':    'Current password',
            'newPassword':        'New password',
            'newPasswordAgain':   'New password again',
            'accountName':        'Account name',
            'tel':                'TEL',
            'loginCode':          'Login code'
        },

        'ja':
        {
            'signupWithTwitter':  'Twitterでサインアップする',
            'signupWithFacebook': 'Facebookでサインアップする',
            'signupWithGoogle':   'Googleでサインアップする',
            'loginWithTwitter':   'Twitterでログインする',
            'loginWithFacebook':  'Facebookでログインする',
            'loginWithGoogle':    'Googleでログインする',
            'email':              'メールアドレス',
            'password':           'パスワード',
            'signup':             'サインアップ',
            'login':              'ログイン',
            'logout':             'ログアウト',
            'goTop':              'トップ画面へ',
            'goSignup':           'サインアップ画面へ',
            'goForget':           'パスワードを忘れた',
            'goSettings':         '設定画面へ',
            'goEmailSettings':    'メールアドレスを設定する',
            'goPasswordSettings': 'パスワードを設定する',
            'goAccountSettings':  'アカウント設定',
            'back':               '戻る',
            'send':               '送信する',
            'sendMail':           'メールを送信する',
            'deleteAccount':      'アカウントを削除する',
            'linkProvider':       '${provider}を紐づける',
            'unlinkProvider':     '${provider}との紐づけを解除する',
            'change':             '変更する',
            'currentPassword':    '現在のパスワード',
            'newPassword':        '新しいパスワード',
            'newPasswordAgain':   'パスワードの確認',
            'accountName':        'アカウント名',
            'tel':                '電話番号',
            'loginCode':          'ログインコード'
        }
    };

    static SIGNUP_WITH_TWITTER =  'signupWithTwitter';
    static SIGNUP_WITH_FACEBOOK = 'signupWithFacebook';
    static SIGNUP_WITH_GOOGLE =   'signupWithGoogle';
    static LOGIN_WITH_TWITTER =   'loginWithTwitter';
    static LOGIN_WITH_FACEBOOK =  'loginWithFacebook';
    static LOGIN_WITH_GOOGLE =    'loginWithGoogle';
    static EMAIL =                'email';
    static PASSWORD =             'password';
    static SIGNUP =               'signup';
    static LOGIN =                'login';
    static LOGOUT =               'logout';
    static GO_TOP =               'goTop';
    static GO_SIGNUP =            'goSignup';
    static GO_FORGET =            'goForget';
    static GO_SETTINGS =          'goSettings';
    static GO_EMAIL_SETTINGS =    'goEmailSettings';
    static GO_PASSWORD_SETTINGS = 'goPasswordSettings';
    static GO_ACCOUNT_SETTINGS =  'goAccountSettings';
    static BACK =                 'back';
    static SEND =                 'send';
    static SEND_MAIL =            'sendMail';
    static DELETE_ACCOUNT =       'deleteAccount';
    static LINK_PROVIDER =        'linkProvider';
    static UNLINK_PROVIDER =      'unlinkProvider';
    static CHANGE =               'change';
    static CURRENT_PASSWORD =     'currentPassword';
    static NEW_PASSWORD =         'newPassword';
    static NEW_PASSWORD_AGAIN =   'newPasswordAgain';
    static ACCOUNT_NAME =         'accountName';
    static TEL =                  'tel';
    static LOGIN_CODE =           'loginCode';

    /**
     * 文字列を取得する
     *
     * @param   phrase  フレーズ
     *
     * @return  文字列
     */
    static text(phrase : string) : string
    {
        const languages = window.navigator['languages'];
        let locale : string = (languages && languages[0]) ||
            window.navigator.language;
//          window.navigator.language ||
//          window.navigator.userLanguage ||
//          window.navigator.browserLanguage;

        locale = locale.substr(0, 2);
        const texts = R.texts[locale];

        if (phrase in texts)
            return texts[phrase];

        return null;
    }
}
