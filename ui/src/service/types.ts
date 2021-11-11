// export interface IResponse {
//   code: number | string;
//   data: any;
//   msg: string;
// }
export interface IResponse<T, E> {
  status: number;
  error?: E;
  data?: T;
}