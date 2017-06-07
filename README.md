# web service templateについて
web service template（以下WST）は登録型ウェブサービス開発に向けたNode.js製のテンプレートです。メールアドレスやSNSアカウントでの登録、紐づけ、SMS（Twilio）やAuthyでの二段階認証に対応しています。AuthyではOneTouch認証も可能です。  

SNSアカウント認証にはpassportを使用し、認証後はカスタムコールバックによりサインアップ画面やトップページなど、適切な画面に遷移します。

# 設定
SNSアカウント認証等に必要な各種設定はappconfig.jsonに記述し、ルートディレクトリ（package.jsonのあるディレクトリ）配下の/config/[NODE_ENV]/に配置します。フォーマットは以下の通り。

```json
{
    "app":
    {
        "app-host":                "localhost",
        "app-port":                80,
        "ssl-key":                 "",
        "ssl-cert":                "",
        "ssl-ca":                  "",
        "ssl-passphrase":          "",
        "session-secret":          "web service template",
        "password-salt":           "webservicetemplate",
        "crypto-key":              "oQ7u6nWdkSACD5GlBaa5",
        "crypto-iv":               "S2z3LCDO3r9uDKYzrhlA",
        "smtp-host":               "smtp.example.com",
        "smtp-port":               587,
        "smtp-user":               "example",
        "smtp-password":           "password",
        "smtp-from":               "web service template <info@example.com>",
        "twitter-consumer-key":    "",
        "twitter-consumer-secret": "",
        "facebook-app-id":         "",
        "facebook-app-secret":     "",
        "google-client-id":        "",
        "google-client-secret":    "",
        "github-client-id":        "",
        "github-client-secret":    "",
        "twilio-account-sid":      "",
        "twilio-auth-token":       "",
        "twilio-from-phone-no":    "",
        "authy-api-key":           "",
        "db-host":                 "",
        "db-user":                 "",
        "db-password":             "",
        "db-name":                 ""
    }
}
```

# 起動方法
npm start
