/**
 * (C) 2016 printf.jp
 */

/**
 * リソース
 */
export default class R
{
    private static texts =
    {
        'en':
        {
            'accountName':                'Account name',
            'authSms':                    '2 step verification',
            'back':                       'Back',
            'change':                     'Change',
            'currentPassword':            'Current password',
            'deleteAccount':              'Delete account',
            'email':                      'Email',
            'errorNetwork':               'Failed to connect to network',
            'goAccountSettings':          'Go account settings',
            'goEmailSettings':            'Go email settings',
            'goForget':                   'Forget password',
            'goPasswordSettings':         'Go password settings',
            'goSettings':                 'Go settings',
            'goSignup':                   'Go sign up',
            'goTop':                      'Go top',
            'linkProvider':               'Link ${provider}',
            'login':                      'Log in',
            'loginCode':                  'Login code',
            'loginWithFacebook':          'Log in with Facebook',
            'loginWithGoogle':            'Log in with Google',
            'loginWithTwitter':           'Log in with Twitter',
            'logout':                     'Log out',
            'newPassword':                'New password',
            'newPasswordAgain':           'New password again',
            'password':                   'Password',
            'problem':                    'There was a problem. Please contact the administrator.',
            'resetPassword':              'Reset password',
            'send':                       'Send',
            'sendMail':                   'Send mail',
            'settings':                   'Settings',
            'settingsAccount':            'Account settings',
            'settingsAccountEmail':       'email settings',
            'settingsAccountEmailChange': 'Confirm email',
            'settingsAccountPassword':    'Password settings',
            'signup':                     'Sign up',
            'signupConfirm':              'Confirm sign up',
            'signupWithFacebook':         'Sign up with Facebook',
            'signupWithGoogle':           'Sign up with Google',
            'signupWithTwitter':          'Sign up with Twitter',
            'tel':                        'TEL',
            'top':                        'Top',
            'unlinkProvider':             'Unlink ${provider}',
        },

        'ja':
        {
            'accountName':                'アカウント名',
            'authSms':                    '二段階認証',
            'back':                       '戻る',
            'change':                     '変更する',
            'currentPassword':            '現在のパスワード',
            'deleteAccount':              'アカウントを削除する',
            'email':                      'メールアドレス',
            'errorNetwork':               '通信に失敗しました。インターネットに接続されているか確認してください。',
            'goAccountSettings':          'アカウント設定',
            'goEmailSettings':            'メールアドレスを設定する',
            'goForget':                   'パスワードを忘れた',
            'goPasswordSettings':         'パスワードを設定する',
            'goSettings':                 '設定画面へ',
            'goSignup':                   'サインアップ画面へ',
            'goTop':                      'トップ画面へ',
            'linkProvider':               '${provider}を紐づける',
            'login':                      'ログイン',
            'loginCode':                  'ログインコード',
            'loginWithFacebook':          'Facebookでログインする',
            'loginWithGoogle':            'Googleでログインする',
            'loginWithTwitter':           'Twitterでログインする',
            'logout':                     'ログアウト',
            'newPassword':                '新しいパスワード',
            'newPasswordAgain':           'パスワードの確認',
            'password':                   'パスワード',
            'problem':                    '問題が発生しました。管理者にお問い合わせください。',
            'resetPassword':              'パスワードリセット',
            'send':                       '送信する',
            'sendMail':                   'メールを送信する',
            'settings':                   '設定',
            'settingsAccount':            'アカウントの設定',
            'settingsAccountEmail':       'メールアドレスの設定',
            'settingsAccountEmailChange': 'メールアドレス設定の確認',
            'settingsAccountPassword':    'パスワードの設定',
            'signup':                     'サインアップ',
            'signupConfirm':              'サインアップの確認',
            'signupWithFacebook':         'Facebookでサインアップする',
            'signupWithGoogle':           'Googleでサインアップする',
            'signupWithTwitter':          'Twitterでサインアップする',
            'tel':                        '電話番号',
            'top':                        'トップ',
            'unlinkProvider':             '${provider}との紐づけを解除する',
        }
    };

    static ACCOUNT_NAME =                  'accountName';
    static AUTH_SMS =                      'authSms';
    static BACK =                          'back';
    static CHANGE =                        'change';
    static CURRENT_PASSWORD =              'currentPassword';
    static DELETE_ACCOUNT =                'deleteAccount';
    static EMAIL =                         'email';
    static ERROR_NETWORK =                 'errorNetwork';
    static GO_ACCOUNT_SETTINGS =           'goAccountSettings';
    static GO_EMAIL_SETTINGS =             'goEmailSettings';
    static GO_FORGET =                     'goForget';
    static GO_PASSWORD_SETTINGS =          'goPasswordSettings';
    static GO_SETTINGS =                   'goSettings';
    static GO_SIGNUP =                     'goSignup';
    static GO_TOP =                        'goTop';
    static LINK_PROVIDER =                 'linkProvider';
    static LOGIN =                         'login';
    static LOGIN_CODE =                    'loginCode';
    static LOGIN_WITH_FACEBOOK =           'loginWithFacebook';
    static LOGIN_WITH_GOOGLE =             'loginWithGoogle';
    static LOGIN_WITH_TWITTER =            'loginWithTwitter';
    static LOGOUT =                        'logout';
    static NEW_PASSWORD =                  'newPassword';
    static NEW_PASSWORD_AGAIN =            'newPasswordAgain';
    static PASSWORD =                      'password';
    static PROBLEM =                       'problem';
    static RESET_PASSWORD =                'resetPassword';
    static SEND =                          'send';
    static SEND_MAIL =                     'sendMail';
    static SETTINGS =                      'settings';
    static SETTINGS_ACCOUNT =              'settingsAccount';
    static SETTINGS_ACCOUNT_EMAIL =        'settingsAccountEmail';
    static SETTINGS_ACCOUNT_EMAIL_CHANGE = 'settingsAccountEmailChange';
    static SETTINGS_ACCOUNT_PASSWORD =     'settingsAccountPassword';
    static SIGNUP =                        'signup';
    static SIGNUP_CONFIRM =                'signupConfirm';
    static SIGNUP_WITH_FACEBOOK =          'signupWithFacebook';
    static SIGNUP_WITH_GOOGLE =            'signupWithGoogle';
    static SIGNUP_WITH_TWITTER =           'signupWithTwitter';
    static TEL =                           'tel';
    static TOP =                           'top';
    static UNLINK_PROVIDER =               'unlinkProvider';

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
