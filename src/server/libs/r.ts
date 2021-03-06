/**
 * (C) 2016 printf.jp
 */
import CommonUtils from 'libs/utils';
import Config      from 'server/config';

import fs = require('fs');

/**
 * リソース
 */
export default class R
{
    private static path : string;

    private static texts =
    {
        'en': {},
        'ja': {}
    };

    static ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG =           'accountNameTooShortOrTooLong';
    static ACCOUNT_NOT_FOUND =                            'accountNotFound';
    static ALREADY_EMAIL_CHANGED =                        'alreadyEmailChanged';
    static ALREADY_EXISTS_EMAIL =                         'alreadyExistsEmail';
    static ALREADY_LOGIN_ANOTHER_ACCOUNT =                'alreadyLoginAnotherAccount';
    static ALREADY_PASSWORD_RESET =                       'alreadyPasswordReset';
    static ALREADY_JOIN =                                 'alreadyJoin';
    static ALREADY_SIGNUP =                               'alreadySignup';
    static ALREADY_USE_USER_NAME =                        'alreadyUseUserName';
    static BAD_REQUEST =                                  'badRequest';
    static CANNOT_EMPTY_EMAIL =                           'cannotEmptyEmail';
    static CANNOT_ENTER_ACCOUNT_NAME_BEFORE_AFTER_SPACE = 'cannotEnterAccountNameBeforeAfterSpace';
    static CANNOT_ENTER_USER_NAME_ONLY_NUMBERS =          'cannotEnterUserNameOnlyNumbers';
    static CANNOT_ENTER_USER_NAME_BEFORE_AFTER_SPACE =    'cannotEnterUserNameBeforeAfterSpace';
    static CANNOT_NO_SET_PASSWORD =                       'cannotNoSetPassword';
    static CANNOT_LINK =                                  'cannotLink';
    static CANNOT_PERFORMED_WITH_AUTHY =                  'cannotPerformedWithAuthy';
    static CANNOT_SET_PASSWORD =                          'cannotSetPassword';
    static CANNOT_SIGNUP =                                'cannotSignup';
    static CANNOT_UNLINK =                                'cannotUnlink';
    static CAN_USE_USER_NAME =                            'canUseUserName';
    static CHANGE_MAIL_SENDED =                           'changeMailSended';
    static COULD_NOT_CHANGE_EMAIL =                       'couldNotChangeEmail';
    static COULD_NOT_SEND_CHANGE_MAIL =                   'couldNotSendChangeMail';
    static COULD_NOT_SEND_INVITE_MAIL =                   'couldNotSendInviteMail';
    static COULD_NOT_SEND_RESET_MAIL =                    'couldNotSendResetMail';
    static COULD_NOT_SEND_SIGNUP_MAIL =                   'couldNotSendSignupMail';
    static COULD_NOT_SEND_SMS =                           'couldNotSendSms';
    static EMAIL_CHANGED =                                'emailChanged';
    static ENTER_ALPHABETICAL_NUMBER =                    'enterAlphabeticalNumber';
    static ENTER_ALPHABETICAL_NUMBER_BAR =                'enterAlphabeticalNumberBar';
    static INCORRECT_ACCOUNT =                            'incorrectAccount';
    static INVALID_COUNTRY_CODE =                         'invalidCountryCode';
    static INVALID_EMAIL =                                'invalidEmail';
    static INVALID_EMAIL_AUTH =                           'invalidEmailAuth';
    static INVALID_PASSWORD =                             'invalidPassword';
    static INVITE_MAIL_SENDED =                           'inviteMailSended';
    static MISMATCH_PASSWORD =                            'mismatchPassword';
    static MISMATCH_SMS_CODE =                            'mismatchSmsCode';
    static NO_LOGIN =                                     'noLogin';
    static NOT_FOUND =                                    'notFound';
    static PASSWORD_CHANGED =                             'passwordChanged';
    static PASSWORD_RESET =                               'passwordReset';
    static PASSWORD_SETTING_CENCELED =                    'passwordSettingCanceled';
    static PASSWORD_TOO_SHORT_OR_TOO_LONG =               'passwordTooShortOrTooLong';
    static REQUIRE_COUNTRY_CODE_AND_PHONE_NO =            'requireCountryCodeAndPhoneNo';
    static RESET_MAIL_SENDED =                            'resetMailSended';
    static SETTINGS_COMPLETED =                           'settingsCompleted';
    static SIGNUP_COMPLETED =                             'signupCompleted';
    static SIGNUP_MAIL_SENDED =                           'signupMailSended';
    static SMS_LOGIN_CODE =                               'smsLoginCode';
    static USER_NAME_TOO_LONG =                           'userNameTooLong';

    private static mailTemplates =
    {
        'en': {},
        'ja': {}
    };

    static NOTICE_INVITE =              'notice-invite';
    static NOTICE_CHANGE_MAIL_ADDRESS = 'notice-change-mail-address';
    static NOTICE_RESET_PASSWORD =      'notice-reset-password';
    static NOTICE_SET_MAIL_ADDRESS =    'notice-set-mail-address';
    static NOTICE_SIGNUP =              'notice-signup';

    /**
     * リソースをロードする
     */
    static load() : void
    {
        R.path = Config.ROOT_DIR + '/resources';

        const locales = ['en', 'ja'];
        for (const locale of locales)
        {
            this.loadTextResources(locale);
            this.loadMailTemplate(R.NOTICE_INVITE,              locale);
            this.loadMailTemplate(R.NOTICE_CHANGE_MAIL_ADDRESS, locale);
            this.loadMailTemplate(R.NOTICE_RESET_PASSWORD,      locale);
            this.loadMailTemplate(R.NOTICE_SET_MAIL_ADDRESS,    locale);
            this.loadMailTemplate(R.NOTICE_SIGNUP,              locale);
        }
    }

    /**
     * テキストリソースをロードする
     *
     * @param   locale  ロケール
     */
    private static loadTextResources(locale : string) : void
    {
        const path = `${R.path}/text/${locale}.json`;

        try
        {
            fs.statSync(path);
            const text = fs.readFileSync(path, 'utf8');
            R.texts[locale] = JSON.parse(text);
        }
        catch (err)
        {
            console.log(`${path}が見つかりません。`);
            process.exit();
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
            const pos = text.indexOf('\n');

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
     * @param   locale  ロケール
     *
     * @return  文字列
     */
    static text(phrase : string, locale : string, args = {}) : string
    {
        if ((locale in R.texts) === false) {
             locale = 'en';
        }

        const texts = R.texts[locale];

        if (phrase in texts) {
            return CommonUtils.formatString(texts[phrase], args);
        }

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

        if (phrase in mailTemplates) {
            return mailTemplates[phrase];
        }

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
