import service from '@/service';
import { IResponse } from '@/service/types';
interface StatementResponse {
  id: string;
  nextUri: string;
  data: Array<Array<any>>;
  columns: {
    fields: Array<{
      name: string;
      data_type: string;
      nullable: boolean;
    }>;
  };
  stats: any;
}

/**
 * 
 * @param sqlText sql
 * @returns StatementResponse
 */
export function getSqlStatement(sqlText: string): Promise<IResponse<StatementResponse, string>> {
  return service.post('/v1/statement', sqlText)
}