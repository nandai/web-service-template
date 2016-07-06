/**
 * (C) 2016 printf.jp
 */
import fs =   require('fs');
import path = require('path');

/**
 * コンフィグ
 */
export default class TestConfig
{
    private static path = __dirname + '/../../appconfig.json';

    static TWITTER_ACCESS_TOKEN = '';
    static TWITTER_REFRESH_TOKEN = '';
    static TWITTER_ID = '';
    static FACEBOOK_ACCESS_TOKEN = '';
    static FACEBOOK_ID = '';

    /**
     * コンフィグをJSONファイルからロードする
     */
    static load() : void
    {
        const absPath = path.resolve(TestConfig.path);
        let text;
        let data;

        try
        {
            fs.statSync(absPath);
            text = fs.readFileSync(absPath, 'utf8');
        }
        catch (err)
        {
            console.log(`${absPath}が見つかりませんでした。`);
            process.exit();
        }

        try
        {
            data = JSON.parse(text);
        }
        catch (err)
        {
            console.log(`${absPath}がJSONではありません。`);
            process.exit();
        }

        let success = false;
        const testData = TestConfig.get(data, 'test');

        TestConfig.TWITTER_ACCESS_TOKEN =  TestConfig.get(testData, 'twitter-access-token');
        TestConfig.TWITTER_REFRESH_TOKEN = TestConfig.get(testData, 'twitter-refresh-token');
        TestConfig.TWITTER_ID =            TestConfig.get(testData, 'twitter-id');
        TestConfig.FACEBOOK_ACCESS_TOKEN = TestConfig.get(testData, 'facebook-access-token');
        TestConfig.FACEBOOK_ID =           TestConfig.get(testData, 'facebook-id');
    }

    /**
     * データを取得する
     */
    private static get(data, key : string) : any
    {
        const result = data[key];
        if (result === undefined)
        {
            console.log(`${key}がありません。`);
            process.exit();
        }
        return result;
    }
}
