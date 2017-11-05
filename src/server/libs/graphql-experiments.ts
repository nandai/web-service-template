/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';

/**
 * GraphQL実験室
 */

// http://graphql.org/graphql-js/object-types/
export class RandomDice
{
    private numSides : number;

    constructor(numSides = 6)
    {
        this.numSides = numSides;
    }

    rollOnce()
    {
        const log = slog.stepIn('RandomDice', 'rollOnce');
        const dice = 1 + Math.floor(Math.random() * this.numSides);

        log.stepOut();
        return dice;
    }

    roll({numRolls})
    {
        const log = slog.stepIn('RandomDice', 'roll');
        const output = [];

        for (let i = 0; i < numRolls; i++) {
            output.push(this.rollOnce());
        }

        log.stepOut();
        return output;
    }
}

// http://graphql.org/graphql-js/mutations-and-input-types/
export class Message
{
    private static message = '';

    static setMessage(param : {message : string}) : string
    {
        const {message} = param;
        Message.message = message;
        return message;
    }

    static getMessage() : string
    {
        return Message.message;
    }
}
