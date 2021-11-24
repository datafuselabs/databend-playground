import service from '@/service';
import { IStatementResponse } from '@/types/sql';
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
export function getSqlQuery(parames: {}): Promise<IStatementResponse> {
  return service.post('/v1/query', parames);
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
