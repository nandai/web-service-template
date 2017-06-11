/**
 * (C) 2016-2017 printf.jp
 */
import Config from 'server/config';

import mongodb =       require('mongodb');
import autoIncrement = require("mongodb-autoincrement");
import slog =          require('server/slog');

/**
 * データベース
 */
export default class Database
{
    private static db : mongodb.Db;

    /**
     * 初期化
     */
    static init()
    {
        return new Promise(async (resolve : () => void) =>
        {
            const log = slog.stepIn('Database', 'init');
            try
            {
                const url = Config.MONGO_URL;
                if (url !== '') {
                    Database.db = await mongodb.MongoClient.connect(url);
                }

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                console.error('MongoDBの初期化に失敗しました。');
                console.error(err.message);
                log.e(err.message);
                log.stepOut();

                // すぐに終了するとログが出力されないので数秒待ってから終了する
                setTimeout(() => process.exit(-1), 3000);
            }
        });
    }

    static collection(name : string) : mongodb.Collection
    {
        return Database.db.collection(name);
    }

    static insertId(name : string)
    {
        return new Promise((resolve : (autoIndex : number) => void, reject) =>
        {
            autoIncrement.getNextSequence(Database.db, name, (err, autoIndex : number) =>
            {
                if (err) {reject(err);}
                else     {resolve(autoIndex);}
            });
        });
    }
}
