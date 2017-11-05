/**
 * (C) 2016-2017 printf.jp
 */
import {onGetUserForGraphQL} from 'server/api/user-api/methods/onGetUser';

import graphql = require('graphql');

export const schema = graphql.buildSchema(`
type User {
    id:          Int
    accountName: String
    name:        String
}

type Query {
  user(id: Int, name: String): User
}
`);

export default class GraphqlRoot
{
    static user = onGetUserForGraphQL;
}
