import service from '@/service';
import { IStatementResponse } from '@/types/sql';
/**
 * 
 * @param sqlText sql
 * @returns StatementResponse
 */
export function getSqlStatement(sqlText: string): Promise<IStatementResponse> {
  return service.post('/v1/statement', sqlText)
}
