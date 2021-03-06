/**
 * (C) 2016-2018 printf.jp
 */
import {slog} from 'libs/slog';
import Config from 'server/config';

import * as mongodb from 'mongodb';
import * as autoIncrement from 'mongodb-autoincrement';

/**
 * データベース
 */
export default class Database
{
    private static db : mongodb.Db;

    /**
     * 初期化
     */
    static async init() : Promise<void>
    {
        const log = slog.stepIn('MongoDB', 'init');
        try
        {
            if (Config.hasMongoDB())
            {
                const url = Config.MONGO_URL;
                Database.db = await mongodb.connect(url);
            }

            log.stepOut();
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
    }

    static collection(name : string) : Collection
    {
        const collection = Database.db.collection(name);
        return new Collection(collection, name);
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

/**
 * コレクション
 */
class Collection
{
    private collection : mongodb.Collection;
    private name       : string;

    /**
     * @constructor
     */
    constructor(collection : mongodb.Collection, name : string)
    {
        this.collection = collection;
        this.name = name;
    }

    insert(obj : object)
    {
        const log = slog.stepIn('Collection', 'insert');
        log.d(`${this.name}:${JSON.stringify(obj, null, 2)}`);
        log.stepOut();
        return this.collection.insert(obj);
    }

    update(filter : object, obj : object)
    {
        const log = slog.stepIn('Collection', 'update');
        log.d(`${this.name}:${JSON.stringify(filter, null, 2)}\n${JSON.stringify(obj, null, 2)}`);
        log.stepOut();
        return this.collection.update(filter, obj);
    }

    deleteOne(filter : object)
    {
        const log = slog.stepIn('Collection', 'deleteOne');
        log.d(`${this.name}:${JSON.stringify(filter, null, 2)}`);
        log.stepOut();
        return this.collection.deleteOne(filter);
    }

    async find(filter : object, orderBy? : object, pos : {offset? : number, limit? : number} = {}) : Promise<any[]>
    {
        const log = slog.stepIn('Collection', 'find');
        log.d(`${this.name}:${JSON.stringify(filter, null, 2)}`);
        let cursor = await this.collection.find(filter);

        if (orderBy) {
            cursor = cursor.sort(orderBy);
        }

        if (pos.offset) {
            cursor = cursor.skip(pos.offset);
        }

        if (pos.limit) {
            cursor = cursor.limit(pos.limit);
        }

        const results = await cursor.toArray();

        log.d(`取得件数：${results.length} 件`);
        log.stepOut();
        return results;
    }
}
