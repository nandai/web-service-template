# web service templateについて
web service template（以下WST）は登録型ウェブサービス開発に向けたNode.js製のテンプレートです。メールアドレスやSNSアカウントでの登録、他のSNSアカウントの紐づけ、Twilioによる二段階認証に対応しています。  
  
SNSアカウント認証にはpassportを使用し、認証後はカスタムコールバックによりサインアップ画面やトップページなど、適切な画面に遷移することが特長です。

# 設定
SNSアカウント認証等に必要な各種設定はappconfig.jsonに記述し、ルートディレクトリ（package.jsonのあるディレクトリ）に配置します。フォーマットは以下の通り。

```
{
    "app":
    {
        "app-host":                "localhost",
        "app-port":                80,
        "ssl-key":                 "",
        "ssl-cert":                "",
        "ssl-ca":                  "",
        "ssl-passphrase":          "",
        "session-secret":          "",
        "password-salt":           "",
        "smtp-host":               "",
        "smtp-port":               587,
        "smtp-user":               "",
        "smtp-password":           "",
        "smtp-from":               "",
        "twitter-consumer-key":    "",
        "twitter-consumer-secret": "",
        "facebook-app-id":         "",
        "facebook-app-secret":     "",
        "google-client-id":        "",
        "google-client-secret":    "",
        "twilio-account_sid":      "",
        "twilio-auth-token":       "",
        "twilio-from-phone-no":    ""
    }
}
```

