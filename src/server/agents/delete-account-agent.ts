/**
 * (C) 2016-2018 printf.jp
 */
import Config            from 'server/config';
import MongoDBCollection from 'server/database/mongodb/delete-account-collection';
import MySQLCollection   from 'server/database/mysql/delete-account-collection';
import Utils             from 'server/libs/utils';
import {Account}         from 'server/models/account';

import * as _ from 'lodash';

function collection()
{
    switch (Config.SELECT_DB)
     {
        case 'mongodb': return MongoDBCollection;
        case 'mysql':   return MySQLCollection;
    }
}

/**
 * アカウント削除エージェント
 */
export default class DeleteAccountAgent
{
    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     */
    static async add(model : Account)
    {
        const newModel = _.clone(model);
        newModel.deleted_at = Utils.now();
        return collection().add(newModel);
    }
}
