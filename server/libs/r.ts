/**
 * (C) 2016 printf.jp
 */

/**
 * リソース
 */
export default class R
{
    private static dict =
    {
        "incorrectAccount": "アカウントが正しくありません。",
        "alreadyLoginAnotherAccount": "既に別のアカウントでログインしています。",
        "alreadySignup": "既に登録されています。",
        "alreadyEmailChanged": "メールアドレスは変更済みです。",
        "alreadyPasswordReset": "パスワードはリセット済みです。",
        "cannotSignup": "ログインしているので登録できません。",
        "invalidEmailAuth": "メールアドレス、またはパスワードが正しくありません。",
        "invalidEmail": "メールアドレスが正しくありません。",
        "invalidPassword": "パスワードが正しくありません。",
        "badRequest": "リクエストが正しくありません。",
        "notFound": "存在しませんでした。",
        "noLogin": "ログインしていません。",
        "resetMailSended": "パスワードリセットのメールを送信しました。",
        "couldNotSendResetMail": "パスワードリセットのメールを送信できませんでした。",
        "emailChanged": "メールアドレスを変更しました。",
        "passwordTooShortOrTooLong": "パスワードが短い、または長すぎます。",
        "mismatchPassword": "パスワードが一致していません。",
        "passwordReset": "パスワードをリセットしました。",
        "passwordChanged": "パスワードを変更しました。",
        "accountNameTooShortOrTooLong": "アカウント名が短い、または長すぎます。",
        "settingsCompleted": "設定を完了しました。"
    };

    static INCORRECT_ACCOUNT = 'incorrectAccount';
    static ALREADY_LOGIN_ANOTHER_ACCOUNT = 'alreadyLoginAnotherAccount';
    static ALREADY_SIGNUP = 'alreadySignup';
    static ALREADY_EMAIL_CHANGED = 'alreadyEmailChanged';
    static ALREADY_PASSWORD_RESET = 'alreadyPasswordReset';
    static CANNOT_SIGNUP = 'cannotSignup';
    static INVALID_EMAIL_AUTH = 'invalidEmailAuth';
    static INVALID_EMAIL = 'invalidEmail';
    static INVALID_PASSWORD = 'invalidPassword';
    static BAD_REQUEST = 'badRequest';
    static NOT_FOUND = 'notFound';
    static NO_LOGIN = 'noLogin';
    static RESET_MAIL_SENDED = 'resetMailSended';
    static COULD_NOT_SEND_RESET_MAIL = 'couldNotSendResetMail';
    static EMAIL_CHANGED = 'emailChanged';
    static PASSWORD_TOO_SHORT_OR_TOO_LONG = 'passwordTooShortOrTooLong';
    static MISMATCH_PASSWORD = 'mismatchPassword';
    static PASSWORD_RESET = 'passwordReset';
    static PASSWORD_CHANGED = 'passwordChanged';
    static ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG = 'accountNameTooShortOrTooLong';
    static SETTINGS_COMPLETED = 'settingsCompleted';

    /**
     * 文字列を取得する
     *
     * @param   phrase  フレーズ
     * @return  文字列
     */
    static text(phrase : string) : string
    {
        if (phrase in R.dict)
            return R.dict[phrase];

        return null;
    }
}
