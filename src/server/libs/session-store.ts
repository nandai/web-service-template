/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';

import session = require('express-session');
import util =    require('util');

const Store = session.Store;

export function SessionStore()
{
    Store.call(this);
    this.session = null;
}

util.inherits(SessionStore, Store);

SessionStore.prototype.all = function all(callback)
{
    const log = slog.stepIn('SessionStore', 'all');
    if (callback) {
        callback(null, {});
    }
    log.stepOut();
};

SessionStore.prototype.clear = function clear(callback)
{
    const log = slog.stepIn('SessionStore', 'clear');
    if (callback) {
        callback(null);
    }
    log.stepOut();
};

SessionStore.prototype.destroy = function destroy(_sessionId, callback)
{
    const log = slog.stepIn('SessionStore', 'destroy');
    if (callback) {
        callback(null);
    }
    log.stepOut();
};

SessionStore.prototype.get = function get(_sessionId, callback)
{
    const log = slog.stepIn('SessionStore', 'get');
    if (callback) {
        callback(null, this.session);
    }
    log.stepOut();
};

SessionStore.prototype.set = function set(sessionId, aSession, callback)
{
    const log = slog.stepIn('SessionStore', 'set');
    log.d(`sessionId: ${sessionId}`);
    log.d(JSON.stringify(aSession, null, 2));

    this.session = aSession;
    if (callback) {
        callback(null);
    }
    log.stepOut();
};

SessionStore.prototype.length = function length(callback)
{
    const log = slog.stepIn('SessionStore', 'length');
    if (callback) {
        callback(null, 0);
    }
    log.stepOut();
};
