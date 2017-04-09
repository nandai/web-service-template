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
            'authSms':                    '2 step verification',
            'signupWithTwitter':          'Sign up with Twitter',
            'signupWithFacebook':         'Sign up with Facebook',
            'signupWithGoogle':           'Sign up with Google',
            'loginWithTwitter':           'Log in with Twitter',
            'loginWithFacebook':          'Log in with Facebook',
            'loginWithGoogle':            'Log in with Google',
            'email':                      'Email',
            'password':                   'Password',
            'signup':                     'Sign up',
            'signupConfirm':              'Confirm sign up',
            'login':                      'Log in',
            'logout':                     'Log out',
            'goTop':                      'Go top',
            'goSignup':                   'Go sign up',
            'goForget':                   'Forget password',
            'goSettings':                 'Go settings',
            'goEmailSettings':            'Go email settings',
            'goPasswordSettings':         'Go password settings',
            'goAccountSettings':          'Go account settings',
            'back':                       'Back',
            'send':                       'Send',
            'sendMail':                   'Send mail',
            'settings':                   'Settings',
            'settingsAccount':            'Account settings',
            'settingsAccountEmail':       'email settings',
            'settingsAccountEmailChange': 'Confirm email',
            'settingsAccountPassword':    'Password settings',
            'deleteAccount':              'Delete account',
            'linkProvider':               'Link ${provider}',
            'unlinkProvider':             'Unlink ${provider}',
            'change':                     'Change',
            'currentPassword':            'Current password',
            'newPassword':                'New password',
            'newPasswordAgain':           'New password again',
            'accountName':                'Account name',
            'tel':                        'TEL',
            'top':                        'Top',
            'loginCode':                  'Login code',
            'resetPassword':              'Reset password',
            'errorNetwork':               'Failed to connect to network',
        },

        'ja':
        {
            'authSms':                    '二段階認証',
            'signupWithTwitter':          'Twitterでサインアップする',
            'signupWithFacebook':         'Facebookでサインアップする',
            'signupWithGoogle':           'Googleでサインアップする',
            'loginWithTwitter':           'Twitterでログインする',
            'loginWithFacebook':          'Facebookでログインする',
            'loginWithGoogle':            'Googleでログインする',
            'email':                      'メールアドレス',
            'password':                   'パスワード',
            'signup':                     'サインアップ',
            'signupConfirm':              'サインアップの確認',
            'login':                      'ログイン',
            'logout':                     'ログアウト',
            'goTop':                      'トップ画面へ',
            'goSignup':                   'サインアップ画面へ',
            'goForget':                   'パスワードを忘れた',
            'goSettings':                 '設定画面へ',
            'goEmailSettings':            'メールアドレスを設定する',
            'goPasswordSettings':         'パスワードを設定する',
            'goAccountSettings':          'アカウント設定',
            'back':                       '戻る',
            'send':                       '送信する',
            'sendMail':                   'メールを送信する',
            'settings':                   '設定',
            'settingsAccount':            'アカウントの設定',
            'settingsAccountEmail':       'メールアドレスの設定',
            'settingsAccountEmailChange': 'メールアドレス設定の確認',
            'settingsAccountPassword':    'パスワードの設定',
            'deleteAccount':              'アカウントを削除する',
            'linkProvider':               '${provider}を紐づける',
            'unlinkProvider':             '${provider}との紐づけを解除する',
            'change':                     '変更する',
            'currentPassword':            '現在のパスワード',
            'newPassword':                '新しいパスワード',
            'newPasswordAgain':           'パスワードの確認',
            'accountName':                'アカウント名',
            'tel':                        '電話番号',
            'top':                        'トップ',
            'loginCode':                  'ログインコード',
            'resetPassword':              'パスワードリセット',
            'errorNetwork':               '通信に失敗しました。インターネットに接続されているか確認してください。'
        }
    };

    static AUTH_SMS =                      'authSms';
    static SIGNUP_WITH_TWITTER =           'signupWithTwitter';
    static SIGNUP_WITH_FACEBOOK =          'signupWithFacebook';
    static SIGNUP_WITH_GOOGLE =            'signupWithGoogle';
    static LOGIN_WITH_TWITTER =            'loginWithTwitter';
    static LOGIN_WITH_FACEBOOK =           'loginWithFacebook';
    static LOGIN_WITH_GOOGLE =             'loginWithGoogle';
    static EMAIL =                         'email';
    static PASSWORD =                      'password';
    static SIGNUP =                        'signup';
    static SIGNUP_CONFIRM =                'signupConfirm';
    static LOGIN =                         'login';
    static LOGOUT =                        'logout';
    static GO_TOP =                        'goTop';
    static GO_SIGNUP =                     'goSignup';
    static GO_FORGET =                     'goForget';
    static GO_SETTINGS =                   'goSettings';
    static GO_EMAIL_SETTINGS =             'goEmailSettings';
    static GO_PASSWORD_SETTINGS =          'goPasswordSettings';
    static GO_ACCOUNT_SETTINGS =           'goAccountSettings';
    static BACK =                          'back';
    static SEND =                          'send';
    static SEND_MAIL =                     'sendMail';
    static SETTINGS =                      'settings';
    static SETTINGS_ACCOUNT =              'settingsAccount';
    static SETTINGS_ACCOUNT_EMAIL =        'settingsAccountEmail';
    static SETTINGS_ACCOUNT_EMAIL_CHANGE = 'settingsAccountEmailChange';
    static SETTINGS_ACCOUNT_PASSWORD =     'settingsAccountPassword';
    static DELETE_ACCOUNT =                'deleteAccount';
    static LINK_PROVIDER =                 'linkProvider';
    static UNLINK_PROVIDER =               'unlinkProvider';
    static CHANGE =                        'change';
    static CURRENT_PASSWORD =              'currentPassword';
    static NEW_PASSWORD =                  'newPassword';
    static NEW_PASSWORD_AGAIN =            'newPasswordAgain';
    static ACCOUNT_NAME =                  'accountName';
    static TEL =                           'tel';
    static TOP =                           'top';
    static LOGIN_CODE =                    'loginCode';
    static RESET_PASSWORD =                'resetPassword';
    static ERROR_NETWORK =                 'errorNetwork';

    /**
     * 文字列を取得する
     *
     * @param   phrase  フレーズ
     *
     * @return  文字列
     */
    static text(phrase : string, locale : string) : string
    {
        const texts = R.texts[locale];

        if (phrase in texts)
            return texts[phrase];

        return null;
    }
}
