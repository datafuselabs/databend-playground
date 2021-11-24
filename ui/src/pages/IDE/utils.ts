import { killStatement } from "@/apis/sql";
export const killConnected = (final_uri: string): void => {
  killStatement(final_uri);
}