/**
 * (C) 2016-2018 printf.jp
 */
import {slog}   from 'libs/slog';
import Config   from 'server/config';
import Utils    from 'server/libs/utils';
import Provider from './provider';

import * as github         from '@octokit/rest';
import * as express        from 'express';
import * as passportGithub from 'passport-github';

const options : github.Options =
{
//  debug: true
};
const api = new github(options);

/**
 * Github
 */
export default class Github extends Provider
{
    private static CLS_NAME_2 = 'Github';

    /**
     * カスタムコールバック
     */
    static customCallback(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        super._customCallback('github', req, res, next);
    }

    /**
     * passportGithub.Strategyに渡すコールバック
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(accessToken : string, refreshToken : string, _profile : passportGithub.Profile, done) : void
    {
        super._verify('github', accessToken, refreshToken, done);
    }

    /**
     * GitHubからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async callback(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(Github.CLS_NAME_2, 'callback');
        try
        {
            const _github = new Github();
            await _github.signupOrLogin(req, res);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * Githubに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, _refreshToken : string) : Promise<void>
    {
        const log = slog.stepIn(Github.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve : () => void) =>
        {
            try
            {
                api.authenticate({
                    type: 'basic',
                    username: Config.GITHUB_CLIENT_ID,
                    password: Config.GITHUB_CLIENT_SECRET
                });

                api.authorization.check(
                {
                    access_token: accessToken,
                    client_id:    Config.GITHUB_CLIENT_ID
                },
                (_err, result) =>
                {
//                  console.log(err);
//                  console.log(JSON.stringify(result, null, 2));

                    if (result)
                    {
                        self.id =   result.data.user.id;
                        self.name = result.data.user.login;
                    }

                    log.stepOut();
                    resolve();
                });
            }
            catch (err)
            {
                log.d(err);
                log.stepOut();
                resolve();
            }
        });
    }
}
