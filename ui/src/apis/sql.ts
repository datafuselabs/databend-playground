import service from '@/service';
import { IStatementResponse } from '@/types/sql';
import axios, { Canceler } from 'axios';
/**
 * 
 * @param sqlText sql
 * @returns StatementResponse
 */
export function getSqlStatement(sqlText: string): Promise<IStatementResponse> {
  return service.post('/v1/statement', sqlText, {
    headers: {
      "Content-Type": "application/text"
    }
  })
}
const getSqlQueryCancelToken = axios.CancelToken;
export let getSqlQueryToken: Canceler;
export function getSqlQuery(parames: { sql: string }): Promise<IStatementResponse> {
  return service.post('/v1/query', parames, {
    cancelToken: new getSqlQueryCancelToken(function executor(c) {
      // An executor function receives a cancel function as a parameter
      getSqlQueryToken = c;
    })
  });
}
export function getSqlNextStatement(next_uri: string): Promise<IStatementResponse> {
  return service.post(next_uri);
}
export function getSqlStatus(stats_uri: string): Promise<IStatementResponse> {
  return service.get(stats_uri);
}
export function killStatement(final_uri: string): Promise<IStatementResponse> {
  return service.get(final_uri);
}
