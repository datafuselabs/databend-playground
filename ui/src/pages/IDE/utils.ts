import { killStatement } from "@/apis/sql";
export const killConnected = (final_uri: string): boolean => {
  killStatement(final_uri);
  return true;
}