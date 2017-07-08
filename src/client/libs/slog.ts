/*
 * Copyright (C) 2011-2017 printf.jp
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @namespace slog
 */
export namespace slog
{
    const STEP_IN =  0;
    const STEP_OUT = 1;
    const MESSAGE =  2;

    const DEBUG = 0;    // デバッグ
    const INFO =  1;    // 情報
    const WARN =  2;    // 警告
    const ERROR = 3;    // エラー

    const INIT =       -1;
    const CONNECTING =  0;
    const OPEN =        1;
    const CLOSED =      3;

    /**
     * シーケンスログクライアント（singleton）
     *
     * @class   SequenceLogClient
     */
    class SequenceLogClient
    {
        /**
         * WebSocketの状態
         */
        readyState = INIT;

        /**
         * WebSocket
         */
        ws : WebSocket;

        /**
         * ログレベル
         */
        logLevel : number;

        /**
         * シーケンスNo
         */
        seqNo = 0;

        /**
         * 擬似スレッドID
         */
        tid = Math.floor(Math.random () * 0x7FFF);

        /**
         * シーケンスログリスト
         */
        sequenceLogList : SequenceLog[] = [];

        /**
         * sequenceLogListの現在位置
         */
        sequenceLogListPos = 0;

        /**
         * 接続が完了する前に出力されたログを貯めておくリスト
         */
        itemList : SequenceLogItem[] = [];

        /**
         * itemListの現在位置
         */
        itemListPos = 0;

        /**
         * 送信バッファ
         */
        arrayList : Uint8Array[] = [];

        /**
         * コンストラクタ
         *
         * @constructor
         */
        constructor()
        {
            let i = 11; // 最小サイズ（STEP_OUT時のバッファサイズ）

            for (; i < 192; i++) {
                this.arrayList[i] = new Uint8Array(i);
            }
        }

        /**
         * ログ出力設定を行います。
         *
         * @method  setConfig
         *
         * @param   address     Sequence Log Serviceへの接続情報
         * @param   fileName    ログの出力ファイル名
         * @param   logLevel    ログレベル
         * @param   userName    ユーザー名
         * @param   passwd      パスワード
         *
         * @return  なし
         */
        setConfig(address : string, fileName : string, logLevel : string, userName : string, passwd : string) : void
        {
            if (logLevel === 'ALL')   {this.logLevel = DEBUG - 1;}
            if (logLevel === 'DEBUG') {this.logLevel = DEBUG;}
            if (logLevel === 'INFO')  {this.logLevel = INFO;}
            if (logLevel === 'WARN')  {this.logLevel = WARN;}
            if (logLevel === 'ERROR') {this.logLevel = ERROR;}
            if (logLevel === 'NONE')  {this.logLevel = ERROR + 1;}

            if (this.logLevel === ERROR + 1) {
                return;
            }

            // 接続
            const self = this;
            this.ws = new WebSocket(address + '/outputLog');
            this.ws.binaryType = 'arraybuffer';
            this.readyState = CONNECTING;

            this.ws.onopen = () =>
            {
                self.readyState = OPEN;

                const fileNameLen = self.getStringBytes(fileName) + 1;
                const userNameLen = self.getStringBytes(userName) + 1;
                const passwdLen =   self.getStringBytes(passwd)   + 1;

                const array = new Uint8Array(
                    4 +
                    4 + userNameLen +
                    4 + passwdLen +
                    4 + fileNameLen +
                    4);
                let pos = 0;

                // プロセスID
                const pid = 0;
                array[pos++] = (pid >> 24) & 0xFF;
                array[pos++] = (pid >> 16) & 0xFF;
                array[pos++] = (pid >>  8) & 0xFF;
                array[pos++] =  pid        & 0xFF;

                // ユーザー名
                array[pos++] = (userNameLen >> 24) & 0xFF;
                array[pos++] = (userNameLen >> 16) & 0xFF;
                array[pos++] = (userNameLen >>  8) & 0xFF;
                array[pos++] =  userNameLen        & 0xFF;

                self.setStringToUint8Array(array, pos, userName);
                pos += userNameLen;

                // パスワード
                array[pos++] = (passwdLen >> 24) & 0xFF;
                array[pos++] = (passwdLen >> 16) & 0xFF;
                array[pos++] = (passwdLen >>  8) & 0xFF;
                array[pos++] =  passwdLen        & 0xFF;

                self.setStringToUint8Array(array, pos, passwd);
                pos += passwdLen;

                // シーケンスログファイル名
                array[pos++] = (fileNameLen >> 24) & 0xFF;
                array[pos++] = (fileNameLen >> 16) & 0xFF;
                array[pos++] = (fileNameLen >>  8) & 0xFF;
                array[pos++] =  fileNameLen        & 0xFF;

                self.setStringToUint8Array(array, pos, fileName);
                pos += fileNameLen;

                // ログレベル
                array[pos++] = (self.logLevel >> 24) & 0xFF;
                array[pos++] = (self.logLevel >> 16) & 0xFF;
                array[pos++] = (self.logLevel >>  8) & 0xFF;
                array[pos++] =  self.logLevel        & 0xFF;

                // 送信
                self.ws.send(array.buffer);
                self.sendAllItems();
            };

            this.ws.onmessage = (e) =>
            {
//              const array = new DataView(e.data);
//              const seqNo = array.getInt32(0);
            };

            this.ws.onerror = () =>
            {
                self.readyState = CLOSED;
                console.error('error slog WebSocket');
            };

            this.ws.onclose = () =>
            {
                self.readyState = CLOSED;
                console.info('close slog WebSocket');
            };
        }

        /**
         * シーケンスNoを取得します。
         *
         * @method  getSequenceNo
         *
         * @return  シーケンスNo
         */
        getSequenceNo() : number
        {
            this.seqNo++;
            return this.seqNo;
        }

        /**
         * 文字列のバイト数を取得します。
         *
         * @method  getStringBytes
         *
         * @param   str バイト数を取得する文字列（UTF-8）
         *
         * @return  文字列のバイト数
         */
        getStringBytes(str : string) : number
        {
            const len = str.length;
            let bytes = 0;

            for (let i = 0; i < len; i++)
            {
                const c = str.charCodeAt(i);

                if (c <= 0x7F)
                {
                    bytes += 1;
                }
                else if (c <= 0x07FF)
                {
                    bytes += 2;
                }
                else if (c <= 0xFFFF)
                {
                    bytes += 3;
                }
                else
                {
                    bytes += 4;
                }
            }

            return bytes;
        }

        /**
         * 文字列をUint8Arrayに変換します。
         *
         * @method  setStringToUint8Array
         *
         * @param   array   変換先
         * @param   offset  arrayへのオフセット
         * @param   str     Uint8Arrayに変換する文字列（UTF-8）
         *
         * @return  文字列のバイト数
         */
        setStringToUint8Array(array : Uint8Array, offset : number, str : string) : number
        {
            const len = str.length;
            let pos = offset;

            for (let i = 0; i < len; i++)
            {
                const c = str.charCodeAt(i);

                if (c <= 0x7F)
                {
                    array[pos++] = c;
                }

                else if (c <= 0x07FF)
                {
                    array[pos++] = 0xC0 | (c >>> 6);
                    array[pos++] = 0x80 | (c & 0x3F);
                }

                else if (c <= 0xFFFF)
                {
                    array[pos++] = 0xE0 |  (c >>> 12);
                    array[pos++] = 0x80 | ((c >>>  6) & 0x3F);
                    array[pos++] = 0x80 |  (c         & 0x3F);
                }

                else
                {
                    array[pos++] = 0xF0 |  (c >>> 18);
                    array[pos++] = 0x80 | ((c >>> 12) & 0x3F);
                    array[pos++] = 0x80 | ((c >>>  6) & 0x3F);
                    array[pos++] = 0x80 |  (c         & 0x3F);
                }
            }

            return (pos - offset);
        }

        /**
         * ログ出力可能かどうか調べます。
         *
         * @method  canOutput
         *
         * @return  ログ出力が可能な場合はtrue
         */
        canOutput() : boolean
        {
            if (this.logLevel === ERROR + 1) {
                return false;
            }

            if (this.readyState !== CONNECTING
            &&  this.readyState !== OPEN)
            {
                return false;
            }

            return true;
        }

        /**
         * SequenceLogItemのバイト数を取得します。
         *
         * @method  getItemBytes
         *
         * @param   item    バイト数を取得するSequenceLogItem
         *
         * @return  SequenceLogItemのバイト数
         */
        getItemBytes(item : SequenceLogItem) : number
        {
            let pos = 0;
            let len = 0;

            // レコード長
            pos += 2;

            // シーケンス番号
            pos += 4;

            // シーケンスログアイテム種別
            pos += 1;

            // スレッド ID
            pos += 4;

            switch (item.type)
            {
            case STEP_IN:
                // クラス名
                pos += 4;

                pos += 2;       // クラス名の長さを格納する領域２バイト分空けておく）

                len = this.getStringBytes(item.className);
                pos += len;

                // 関数名
                pos += 4;

                pos += 2;       // 関数名の長さを格納する領域２バイト分空けておく）

                len = this.getStringBytes(item.funcName);
                pos += len;
                break;

            case STEP_OUT:
                break;

            case MESSAGE:
                // メッセージ
                pos += 1;

                pos += 4;

                pos += 2;       // メッセージの長さを格納する領域２バイト分空けておく）

                len = this.getStringBytes(item.message);
                pos += len;
                break;
            }

            return pos;
        }

        /**
         * SequenceLogItemをUint8Arrayに変換します。
         *
         * @method  setStringToUint8Array
         *
         * @param   array   変換先
         * @param   offset  arrayへのオフセット
         * @param   item    Uint8Arrayに変換するSequenceLogItem
         *
         * @return  文字列のバイト数
         */
        itemToUint8Array(array : Uint8Array, offset : number, item : SequenceLogItem) : number
        {
            let pos = offset;
            let posSave = 0;
            let len = 0;

            // レコード長
            pos += 2;

            // シーケンス番号
            array[pos++] = (item.seqNo >> 24) & 0xFF;
            array[pos++] = (item.seqNo >> 16) & 0xFF;
            array[pos++] = (item.seqNo >>  8) & 0xFF;
            array[pos++] =  item.seqNo        & 0xFF;

            // シーケンスログアイテム種別
            array[pos++] = item.type;

            // スレッド ID
            const tid = this.tid;
            array[pos++] = (tid >> 24) & 0xFF;
            array[pos++] = (tid >> 16) & 0xFF;
            array[pos++] = (tid >>  8) & 0xFF;
            array[pos++] =  tid        & 0xFF;

            switch (item.type)
            {
            case STEP_IN:
                // クラス名
                // ID は 0 固定
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;

                posSave = pos;
                pos += 2;       // クラス名の長さを格納する領域２バイト分空けておく）

                len = this.setStringToUint8Array(array, pos, item.className);
                pos += len;

                array[posSave++] = (len >>  8) & 0xFF;
                array[posSave++] =  len        & 0xFF;

                // 関数名
                // ID は 0 固定
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;

                posSave = pos;
                pos += 2;       // 関数名の長さを格納する領域２バイト分空けておく）

                len = this.setStringToUint8Array(array, pos, item.funcName);
                pos += len;

                array[posSave++] = (len >>  8) & 0xFF;
                array[posSave++] =  len        & 0xFF;
                break;

            case STEP_OUT:
                break;

            case MESSAGE:
                // メッセージ
                // ログレベル
                array[pos++] = item.level;

                // ID は 0 固定
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;
                array[pos++] = 0;

                posSave = pos;
                pos += 2;       // メッセージの長さを格納する領域２バイト分空けておく）

                len = this.setStringToUint8Array(array, pos, item.message);
                pos += len;

                array[posSave++] = (len >>  8) & 0xFF;
                array[posSave++] =  len        & 0xFF;
                break;
            }

            // 先頭にレコード長
            array[0] = (pos >> 8) & 0xFF;
            array[1] =  pos       & 0xFF;

            return pos;
        }

        /**
         * SequenceLogItemを送信します。
         *
         * @method  sendItem
         *
         * @param   item    送信するSequenceLogItem
         *
         * @return  なし
         */
        sendItem(item : SequenceLogItem) : void
        {
            if (this.readyState === CONNECTING) {
                return;
            }

            const size = this.getItemBytes(item);
            let array : Uint8Array;

            if (size < this.arrayList.length)
            {
                array = this.arrayList[size];
            }
            else
            {
                array = new Uint8Array(size);
            }

            this.itemToUint8Array(array, 0, item);
            this.ws.send(array.buffer);
        }

        /**
         * すべてのSequenceLogItemを送信します。
         *
         * @method  sendAllItems
         *
         * @return  なし
         */
        sendAllItems() : void
        {
            const itemList = this.itemList;
            const count = itemList.length;

            for (let i = 0; i < count; i++)
            {
                const item = itemList[i];
                this.sendItem(item);
            }

            this.itemListPos = 0;
        }

        /**
         * SequenceLogItemを取得します。
         *
         * @method  getItem
         *
         * @return  SequenceLogItem
         */
        getItem() : SequenceLogItem
        {
            if (this.readyState === OPEN) {
                this.itemListPos = 0;
            }

            const itemList = this.itemList;
            const count = itemList.length;

            const pos = this.itemListPos++;

            if (pos === count)
            {
                const item = new SequenceLogItem();
                itemList[count] = item;
            }

            return itemList[pos];
        }

        /**
         * SequenceLogを取得します。
         *
         * @method  getSequenceLog
         *
         * @return  SequenceLog
         */
        getSequenceLog() : SequenceLog
        {
            const sequenceLogList = this.sequenceLogList;
            const count = sequenceLogList.length;

            const pos = this.sequenceLogListPos++;

            if (pos === count)
            {
                const sequenceLog = new SequenceLog();
                sequenceLogList[count] = sequenceLog;
            }

            return sequenceLogList[pos];
        }
    }

    /**
     * シーケンスログアイテム
     *
     * @class   SequenceLogItem
     */
    class SequenceLogItem
    {
        /**
         * シーケンスNo
         */
        seqNo = 0;

        /**
         * タイプ
         */
        type : number;

        /**
         * スレッドID
         */
//      threadId : number;

        /**
         * クラスID
         */
//      classId : number;

        /**
         * メソッドID
         */
//      funcId : number;

        /**
         * ログレベル
         */
        level = 0;

        /**
         * メッセージID
         */
//      messageId : number;

        /**
         * クラス名
         */
        className = '';

        /**
         * メソッド名
         */
        funcName = '';

        /**
         * メッセージ
         */
        message = '';
    }

    /**
     * シーケンスログ
     *
     * @class   SequenceLog
     */
    export class SequenceLog
    {
        /**
         * シーケンスNo
         */
        seqNo : number;

        /**
         * メソッドのコールログを出力します。
         *
         * @method  stepIn
         *
         * @return  なし
         */
        stepIn(className : string, funcName : string) : void
        {
            if (client.canOutput() === false) {
                return;
            }

            this.seqNo = client.getSequenceNo();

            const item = client.getItem();
            item.seqNo = this.seqNo;
            item.type = STEP_IN;
            item.className = className;
            item.funcName = funcName;

            client.sendItem(item);
        }

        /**
         * メソッドのリターンログを出力します。
         *
         * @method  stepOut
         *
         * @return  なし
         */
        stepOut() : void
        {
            if (client.canOutput() === false) {
                return;
            }

            const item = client.getItem();
            item.seqNo = this.seqNo;
            item.type = STEP_OUT;

            client.sendItem(item);
            client.sequenceLogListPos--;
        }

        d(msg : string) {message(this, DEBUG, msg);}
        i(msg : string) {message(this, INFO,  msg);}
        w(msg : string) {message(this, WARN,  msg);}
        e(msg : string) {message(this, ERROR, msg);}

        /**
         * アサート
         *
         * @method  assert
         *
         * @return  なし
         */
        assert(assertName : string, result : boolean) : void
        {
            if (result) {this.i(assertName + ':PASSED');}
            else        {this.e(assertName + ':FAILED');}
        }
    }

    /**
     * ログメッセージを出力します。
     *
     * @method  message
     *
     * @return  なし
     */
    function message(log : SequenceLog, level : number, msg : string) : void
    {
        if (client.canOutput() === false) {
            return;
        }

        const item = client.getItem();
        item.seqNo = log.seqNo;
        item.type = MESSAGE;
        item.level = level;
        item.message = msg;

        client.sendItem(item);
    }

    /**
     * ログ出力設定を行います。
     *
     * @method  setConfig
     *
     * @param   address     Sequence Log Serviceへの接続情報
     * @param   fileName    ログの出力ファイル名
     * @param   logLevel    ログレベル
     *
     * @return  なし
     */
    export function setConfig(address : string, fileName : string, logLevel : string) : void
    {
        client.setConfig(address, fileName, logLevel, '', '');
    }

    /**
     * メソッドのコールログを出力します。
     *
     * @method  setConfig
     *
     * @param   address     Sequence Log Serviceへの接続情報
     * @param   fileName    ログの出力ファイル名
     * @param   logLevel    ログレベル
     *
     * @return  なし
     */
    export function stepIn(className : string, funcName : string) : SequenceLog
    {
        const sequenceLog = client.getSequenceLog();
        sequenceLog.stepIn(className, funcName);
        return sequenceLog;
    }

    // シーケンスログクライアント生成
    const client = new SequenceLogClient();
}
