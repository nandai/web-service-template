/**
 * (C) 2016-2017 printf.jp
 */
import {buildSchema}         from 'graphql';

import {onGetUserForGraphQL} from 'server/api/user-api/methods/onGetUser';
import {Message,
        RandomDice}          from './graphql-experiments';

export const schema = buildSchema(`
type User {
    id:          Int
    accountName: String
    name:        String
}

type RandomDice {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
}

type Query {
    user(id: Int, name: String): User
    getDice(numSides: Int): RandomDice
}
`);

export const authSchema = buildSchema(`
type Query {
    getMessage: String
}

type Mutation {
    setMessage(message: String): String
}
`);

export class GraphqlRoot
{
    static user = onGetUserForGraphQL;

    // 以下実験用
    static getDice = ({numSides}) => new RandomDice(numSides);
}

export class GraphqlAuthRoot
{
    // 以下実験用
    static getMessage = Message.getMessage;
    static setMessage = Message.setMessage;
}
