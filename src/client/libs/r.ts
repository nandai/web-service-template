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
            'about':                      'ABOUT',
            'accountName':                'Account name',
            'authSms':                    'Two-Factor authentication',
            'back':                       'Back',
            'change':                     'Change',
            'countryCode':                'Country Code (e.g.+1)',
            'currentPassword':            'Current password',
            'deleteAccount':              'Delete account',
            'doesDeleteAccount':          'Are you sure you want to delete account?',
            'email':                      'Email',
            'errorNetwork':               'Failed to connect to network',
            'forbidden':                  'FORBIDDEN',
            'goAccountSettings':          'Go account settings',
            'goEmailSettings':            'Go email settings',
            'goForget':                   'Forget password',
            'goPasswordSettings':         'Go password settings',
            'goSettings':                 'Go settings',
            'invite':                     'Invite',
            'join':                       'Join',
            'linkProvider':               'Link ${provider}',
            'login':                      'Log in',
            'loginCode':                  'Login code',
            'loginDt':                    'Last login : ',
            'loginWithFacebook':          'Log in with Facebook',
            'loginWithGithub':            'Log in with Github',
            'loginWithGoogle':            'Log in with Google',
            'loginWithTwitter':           'Log in with Twitter',
            'logout':                     'Log out',
            'newPassword':                'New password',
            'newPasswordAgain':           'New password again',
            'no':                         'No',
            'notFound':                   'NOT FOUND',
            'password':                   'Password',
            'phoneNo':                    'Phone No (e.g.123-456-7890)',
            'problem':                    'There was a problem. Please contact the administrator.',
            'resetPassword':              'Reset password',
            'send':                       'Send',
            'sendMail':                   'Send mail',
            'settings':                   'Settings',
            'settingsAccount':            'Account settings',
            'settingsAccountEmail':       'email settings',
            'settingsAccountEmailChange': 'Confirm email',
            'settingsAccountPassword':    'Password settings',
            'settingsInvite':             'Invite',
            'signup':                     'Sign up',
            'signupConfirm':              'Confirm sign up',
            'signupWithFacebook':         'Sign up with Facebook',
            'signupWithGithub':           'Sign up with Github',
            'signupWithGoogle':           'Sign up with Google',
            'signupWithTwitter':          'Sign up with Twitter',
            'top':                        'Top',
            'twoFactorAuthSms':           'Perform two-factor authentication with SMS.',
            'twoFactorAuthAuthy':         'Perform two-factor authentication with Authy.',
            'twoFactorAuthNone':          'Do not perform two-factor authentication.',
            'unlinkProvider':             'Unlink ${provider}',
            'user':                       'User',
            'userName':                   'User name',
            'userList':                   'User list',
            'withdrawal':                 'Withdrawal',
            'yes':                        'Yes'
        },

        'ja':
        {
            'about':                      'ABOUT',
            'accountName':                'アカウント名',
            'authSms':                    '二段階認証',
            'back':                       '戻る',
            'change':                     '変更する',
            'countryCode':                '国コード (例:+81)',
            'currentPassword':            '現在のパスワード',
            'deleteAccount':              'アカウントを削除する',
            'doesDeleteAccount':          'アカウントを削除してもよろしいですか？',
            'email':                      'メールアドレス',
            'errorNetwork':               '通信に失敗しました。インターネットに接続されているか確認してください。',
            'forbidden':                  'FORBIDDEN',
            'goAccountSettings':          'アカウント設定',
            'goEmailSettings':            'メールアドレスを設定する',
            'goForget':                   'パスワードを忘れた',
            'goPasswordSettings':         'パスワードを設定する',
            'goSettings':                 '設定画面へ',
            'invite':                     '招待する',
            'join':                       '参加する',
            'linkProvider':               '${provider}を紐づける',
            'login':                      'ログイン',
            'loginCode':                  'ログインコード',
            'loginDt':                    '最終ログイン日時：',
            'loginWithFacebook':          'Facebookでログインする',
            'loginWithGithub':            'Githubでログインする',
            'loginWithGoogle':            'Googleでログインする',
            'loginWithTwitter':           'Twitterでログインする',
            'logout':                     'ログアウト',
            'newPassword':                '新しいパスワード',
            'newPasswordAgain':           'パスワードの確認',
            'no':                         'いいえ',
            'notFound':                   'NOT FOUND',
            'password':                   'パスワード',
            'phoneNo':                    '電話番号 (例:03-1234-5678)',
            'problem':                    '問題が発生しました。管理者にお問い合わせください。',
            'resetPassword':              'パスワードリセット',
            'send':                       '送信する',
            'sendMail':                   'メールを送信する',
            'settings':                   '設定',
            'settingsAccount':            'アカウントの設定',
            'settingsAccountEmail':       'メールアドレスの設定',
            'settingsAccountEmailChange': 'メールアドレス設定の確認',
            'settingsAccountPassword':    'パスワードの設定',
            'settingsInvite':             '招待',
            'signup':                     'サインアップ',
            'signupConfirm':              'サインアップの確認',
            'signupWithFacebook':         'Facebookでサインアップする',
            'signupWithGithub':           'Githubでサインアップする',
            'signupWithGoogle':           'Googleでサインアップする',
            'signupWithTwitter':          'Twitterでサインアップする',
            'top':                        'トップ',
            'twoFactorAuthSms':           'SMSで二段階認証を行う',
            'twoFactorAuthAuthy':         'Authyで二段階認証を行う',
            'twoFactorAuthNone':          '二段階認証を行わない',
            'unlinkProvider':             '${provider}との紐づけを解除する',
            'user':                       'ユーザー',
            'userName':                   'ユーザー名',
            'userList':                   'ユーザー一覧',
            'withdrawal':                 '退会',
            'yes':                        'はい'
        }
    };

    static ABOUT =                         'about';
    static ACCOUNT_NAME =                  'accountName';
    static AUTH_SMS =                      'authSms';
    static BACK =                          'back';
    static CHANGE =                        'change';
    static COUNTRY_CODE =                  'countryCode';
    static CURRENT_PASSWORD =              'currentPassword';
    static DELETE_ACCOUNT =                'deleteAccount';
    static DOES_DELETE_ACCOUNT =           'doesDeleteAccount';
    static EMAIL =                         'email';
    static ERROR_NETWORK =                 'errorNetwork';
    static FORBIDDEN =                     'forbidden';
    static GO_ACCOUNT_SETTINGS =           'goAccountSettings';
    static GO_EMAIL_SETTINGS =             'goEmailSettings';
    static GO_FORGET =                     'goForget';
    static GO_PASSWORD_SETTINGS =          'goPasswordSettings';
    static GO_SETTINGS =                   'goSettings';
    static INVITE =                        'invite';
    static JOIN =                          'join';
    static LINK_PROVIDER =                 'linkProvider';
    static LOGIN =                         'login';
    static LOGIN_CODE =                    'loginCode';
    static LOGIN_DT =                      'loginDt';
    static LOGIN_WITH_FACEBOOK =           'loginWithFacebook';
    static LOGIN_WITH_GITHUB =             'loginWithGithub';
    static LOGIN_WITH_GOOGLE =             'loginWithGoogle';
    static LOGIN_WITH_TWITTER =            'loginWithTwitter';
    static LOGOUT =                        'logout';
    static NEW_PASSWORD =                  'newPassword';
    static NEW_PASSWORD_AGAIN =            'newPasswordAgain';
    static NO =                            'no';
    static NOT_FOUND =                     'notFound';
    static PASSWORD =                      'password';
    static PHONE_NO =                      'phoneNo';
    static PROBLEM =                       'problem';
    static RESET_PASSWORD =                'resetPassword';
    static SEND =                          'send';
    static SEND_MAIL =                     'sendMail';
    static SETTINGS =                      'settings';
    static SETTINGS_ACCOUNT =              'settingsAccount';
    static SETTINGS_ACCOUNT_EMAIL =        'settingsAccountEmail';
    static SETTINGS_ACCOUNT_EMAIL_CHANGE = 'settingsAccountEmailChange';
    static SETTINGS_ACCOUNT_PASSWORD =     'settingsAccountPassword';
    static SETTINGS_INVITE =               'settingsInvite';
    static SIGNUP =                        'signup';
    static SIGNUP_CONFIRM =                'signupConfirm';
    static SIGNUP_WITH_FACEBOOK =          'signupWithFacebook';
    static SIGNUP_WITH_GITHUB =            'signupWithGithub';
    static SIGNUP_WITH_GOOGLE =            'signupWithGoogle';
    static SIGNUP_WITH_TWITTER =           'signupWithTwitter';
    static TOP =                           'top';
    static TWO_FACTOR_AUTH_SMS =           'twoFactorAuthSms';
    static TWO_FACTOR_AUTH_AUTHY =         'twoFactorAuthAuthy';
    static TWO_FACTOR_AUTH_NONE =          'twoFactorAuthNone';
    static UNLINK_PROVIDER =               'unlinkProvider';
    static USER =                          'user';
    static USER_NAME =                     'userName';
    static USER_LIST =                     'userList';
    static WITHDRAWAL =                    'withdrawal';
    static YES =                           'yes';

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

        if (phrase in texts) {
            return texts[phrase];
        }

        return null;
    }
}
