/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';
import Config from 'server/config';

import mysql = require('mysql');

/**
 * データベース
 */
export default class Database
{
    private static pool : mysql.Pool;

    /**
     * 初期化
     */
    static async init(): Promise<void>
    {
        const log = slog.stepIn('MySQL', 'init');
        try
        {
            if (Config.hasMySQL())
            {
                const config : mysql.PoolConfig =
                {
                    host:     Config.DB_HOST,
                    user:     Config.DB_USER,
                    password: Config.DB_PASSWORD,
                    database: Config.DB_NAME,
                    charset:  'utf8mb4',
                    timezone: 'utc'
                };
                Database.pool = mysql.createPool(config);

                const conn = await Database.getConnection();
                conn.release();
            }

            log.stepOut();
        }
        catch (err)
        {
            console.error('MySQLの初期化に失敗しました。');
            console.error(err.message);
            log.e(err.message);
            log.stepOut();

            // すぐに終了するとログが出力されないので数秒待ってから終了する
            setTimeout(() => process.exit(-1), 3000);
        }
    }

    /**
     * コネクション取得
     */
    private static getConnection()
    {
        return new Promise((resolve : (conn : Connection) => void, reject : (err : Error) => void) =>
        {
            Database.pool.getConnection((err: mysql.MysqlError, connection: mysql.Connection) =>
            {
                if (err)
                {
                    reject(err);
                    return;
                }

                const conn = new Connection(connection);
                resolve(conn);
            });
        });
    }

    /**
     * クエリー実行
     */
    static async query(sql : string, values?) : Promise<any>
    {
        let conn : Connection;
        try
        {
            conn = await Database.getConnection();
            const results = await conn.query(sql, values);
            conn.release();
            return results;
        }
        catch (err)
        {
            if (conn) {
                conn.release();
            }
            throw err;
        }
    }
}

/**
 * コネクション
 */
class Connection
{
    private connection : mysql.Connection;

    /**
     * @constructor
     */
    constructor(connection : mysql.Connection)
    {
        this.connection = connection;
    }

    /**
     * クエリー実行
     */
    query(sql : string, values?)
    {
        return new Promise((resolve : (results) => void, reject : (err : Error) => void) =>
        {
            const log = slog.stepIn('Connection', 'query');
            const query = this.connection.query(sql, values, (err: mysql.MysqlError, results) =>
            {
                if (err)
                {
                    log.e(err.message);
                    log.stepOut();
                    reject(err);
                    return;
                }

                if (sql.startsWith('SELECT')) {
                    log.d(`取得件数：${results.length} 件`);
                }

                log.stepOut();
                resolve(results);
            });
            log.d(query.sql);
        });
    }

    /**
     * リリース
     */
    release() : void
    {
        this.connection.destroy();
        this.connection = null;
    }
}
