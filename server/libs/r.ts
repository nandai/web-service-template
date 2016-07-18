/**
 * (C) 2016 printf.jp
 */
import fs = require('fs');

/**
 * リソース
 */
export default class R
{
    private static path = __dirname + '/../../resources';

    private static dict =
    {
        "incorrectAccount": "アカウントが正しくありません。",
        "alreadyLoginAnotherAccount": "既に別のアカウントでログインしています。",
        "alreadySignup": "既に登録されています。",
        "alreadyEmailChanged": "メールアドレスは変更済みです。",
        "alreadyPasswordReset": "パスワードはリセット済みです。",
        "alreadyExistsEmail": "そのメールアドレスは既に登録されています。",
        "cannotSignup": "ログインしているので登録できません。",
        "invalidEmailAuth": "メールアドレス、またはパスワードが正しくありません。",
        "invalidEmail": "メールアドレスが正しくありません。",
        "invalidPassword": "パスワードが正しくありません。",
        "badRequest": "リクエストが正しくありません。",
        "notFound": "存在しませんでした。",
        "noLogin": "ログインしていません。",
        "signupMailSended": "仮登録のメールを送信しました。",
        "couldNotSendSignupMail": "仮登録のメールを送信できませんでした。",
        "resetMailSended": "パスワードリセットのメールを送信しました。",
        "couldNotSendResetMail": "パスワードリセットのメールを送信できませんでした。",
        "changeMailSended": "メールアドレス変更手続きのメールを送信しました。",
        "couldNotSendChangeMail": "メールアドレス変更手続きのメールを送信できませんでした。",
        "emailChanged": "メールアドレスを変更しました。",
        "couldNotChangeEmail": "メールアドレスを変更できませんでした。",
        "passwordTooShortOrTooLong": "パスワードが短い、または長すぎます。",
        "mismatchPassword": "パスワードが一致していません。",
        "mismatchSmsCode": "ログインコードが一致していません。",
        "passwordReset": "パスワードをリセットしました。",
        "passwordChanged": "パスワードを変更しました。",
        "accountNameTooShortOrTooLong": "アカウント名が短い、または長すぎます。",
        "signupCompleted": "登録が完了しました。",
        "settingsCompleted": "設定を完了しました。",
        "cannotLink": "紐づけできません。",
        "cannotUnlink": "紐づけを解除できません。",
        "cannotEmptyEmail": "メールアドレスを未設定にできません。"
    };

    static INCORRECT_ACCOUNT = 'incorrectAccount';
    static ALREADY_LOGIN_ANOTHER_ACCOUNT = 'alreadyLoginAnotherAccount';
    static ALREADY_SIGNUP = 'alreadySignup';
    static ALREADY_EMAIL_CHANGED = 'alreadyEmailChanged';
    static ALREADY_PASSWORD_RESET = 'alreadyPasswordReset';
    static ALREADY_EXISTS_EMAIL = 'alreadyExistsEmail';
    static CANNOT_SIGNUP = 'cannotSignup';
    static INVALID_EMAIL_AUTH = 'invalidEmailAuth';
    static INVALID_EMAIL = 'invalidEmail';
    static INVALID_PASSWORD = 'invalidPassword';
    static BAD_REQUEST = 'badRequest';
    static NOT_FOUND = 'notFound';
    static NO_LOGIN = 'noLogin';
    static SIGNUP_MAIL_SENDED = 'signupMailSended';
    static COULD_NOT_SEND_SIGNUP_MAIL = 'couldNotSendSignupMail';
    static RESET_MAIL_SENDED = 'resetMailSended';
    static COULD_NOT_SEND_RESET_MAIL = 'couldNotSendResetMail';
    static CHANGE_MAIL_SENDED = 'changeMailSended';
    static COULD_NOT_SEND_CHANGE_MAIL = 'couldNotSendChangeMail';
    static EMAIL_CHANGED = 'emailChanged';
    static COULD_NOT_CHANGE_EMAIL = 'couldNotChangeEmail';
    static PASSWORD_TOO_SHORT_OR_TOO_LONG = 'passwordTooShortOrTooLong';
    static MISMATCH_PASSWORD = 'mismatchPassword';
    static MISMATCH_SMS_CODE = 'mismatchSmsCode';
    static PASSWORD_RESET = 'passwordReset';
    static PASSWORD_CHANGED = 'passwordChanged';
    static ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG = 'accountNameTooShortOrTooLong';
    static SIGNUP_COMPLETED = 'signupCompleted';
    static SETTINGS_COMPLETED = 'settingsCompleted';
    static CANNOT_LINK = 'cannotLink';
    static CANNOT_UNLINK = 'cannotUnlink';
    static CANNOT_EMPTY_EMAIL = 'cannotEmptyEmail';

    private static mailTemplates =
    {
        'en': {},
        'ja': {}
    };

    static NOTICE_SIGNUP = 'notice-signup';
    static NOTICE_SET_MAIL_ADDRESS = 'notice-set-mail-address';
    static NOTICE_CHANGE_MAIL_ADDRESS = 'notice-change-mail-address';
    static NOTICE_RESET_PASSWORD = 'notice-reset-password';

    /**
     * リソースをロードする
     */
    static load() : void
    {
        const locales = ['en', 'ja'];
        for (const locale of locales)
        {
            this.loadMailTemplate(R.NOTICE_SIGNUP,              locale);
            this.loadMailTemplate(R.NOTICE_SET_MAIL_ADDRESS,    locale);
            this.loadMailTemplate(R.NOTICE_CHANGE_MAIL_ADDRESS, locale);
            this.loadMailTemplate(R.NOTICE_RESET_PASSWORD,      locale);
        }
    }

    /**
     * メールテンプレートをロードする
     *
     * @param   phrase  フレーズ
     * @param   locale  ロケール
     */
    private static loadMailTemplate(phrase : string, locale : string) : void
    {
        const path = `${R.path}/mail/${locale}.${phrase}.txt`;

        try
        {
            fs.statSync(path);
            const text = fs.readFileSync(path, 'utf8');
            let pos = text.indexOf('\n');

            const subject =  text.substr(0, pos);
            const contents = text.substr(pos + 1 + 1);

            const mailTemplates = R.mailTemplates[locale];
            mailTemplates[phrase] = {subject, contents};
        }
        catch (err)
        {
            console.log(`${path}が見つかりません。`);
            process.exit();
        }
    }

    /**
     * 文字列を取得する
     *
     * @param   phrase  フレーズ
     *
     * @return  文字列
     */
    static text(phrase : string) : string
    {
        if (phrase in R.dict)
            return R.dict[phrase];

        return null;
    }

    /**
     * メールテンプレートを取得する
     *
     * @param   phrase  フレーズ
     * @param   locale  ロケール
     *
     * @return  メールテンプレート
     */
    static mail(phrase : string, locale : string) : MailTemplate
    {
        const mailTemplates = R.mailTemplates[locale];

        if (phrase in mailTemplates)
            return mailTemplates[phrase];

        return null;
    }
}

/**
 * メールテンプレート
 */
export interface MailTemplate
{
    subject  : string;
    contents : string;
}
