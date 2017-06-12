/**
 * (C) 2016-2017 printf.jp
 */
import MonboDBCollection from 'server/database/mongodb/delete-account-collection';
import MySQLCollection   from 'server/database/mysql/delete-account-collection';
import Utils             from 'server/libs/utils';
import {Account}         from 'server/models/account';

import _ = require('lodash');

// const Collection = MonboDBCollection;
const Collection = MySQLCollection;

export default class DeleteAccountAgent
{
    private static CLS_NAME = 'DeleteAccountAgent';

    /**
     * アカウントを追加する
     *
     * @param   account アカウント
     */
    static async add(model : Account)
    {
        const newModel = _.clone(model);
        newModel.deleted_at = Utils.now();

        return Collection.add(newModel);
    }
}
