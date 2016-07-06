/**
 * (C) 2016 printf.jp
 */
import fs = require('fs');

/**
 * シーケンス
 */
export class Seq
{
    name : string = null;
    no   : number = null;
}

/**
 * シーケンスモデル
 */
export default class SeqModel
{
    private static list : Seq[] = [];
    private static path = __dirname + '/../../storage/seq.json';

    /**
     * アカウントをJSONファイルからロードする
     */
    static load() : void
    {
        try
        {
            fs.statSync(SeqModel.path);
            const text = fs.readFileSync(SeqModel.path, 'utf8');
            SeqModel.list = JSON.parse(text);
        }
        catch (err)
        {
            SeqModel.save();
        }
    }

    /**
     * アカウントをJSONファイルにセーブする
     */
    private static save() : void
    {
        const text = JSON.stringify(SeqModel.list, null, 2);
        fs.writeFileSync(SeqModel.path, text);
    }

    /**
     * シーケンスNoを採番する
     *
     * @param   name    シーケンス名
     *
     * @return  シーケンスNo
     */
    static next(name : string) : number
    {
        for (const seq of SeqModel.list)
        {
            if (seq.name === name)
            {
                seq.no++;
                SeqModel.save();
                return seq.no;
            }
        }

        const seq = new Seq();
        seq.name = name;
        seq.no = 1;
        SeqModel.list.push(seq);
        SeqModel.save();
        return seq.no;
    }
}
