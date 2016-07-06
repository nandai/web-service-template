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
        "cannotSignup": "ログインしているので登録できません。",
        "invalidEmailAuth": "メールアドレス、またはパスワードが正しくありません。",
        "badRequest": "リクエストが正しくありません。",
        "notFound": "存在しませんでした。",
        "noLogin": "ログインしていません。"
    };

    static INCORRECT_ACCOUNT = 'incorrectAccount';
    static ALREADY_LOGIN_ANOTHER_ACCOUNT = 'alreadyLoginAnotherAccount';
    static ALREADY_SIGNUP = 'alreadySignup';
    static CANNOT_SIGNUP = 'cannotSignup';
    static INVALID_EMAIL_AUTH = 'invalidEmailAuth';
    static BAD_REQUEST = 'badRequest';
    static NOT_FOUND = 'notFound';
    static NO_LOGIN = 'noLogin';

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
