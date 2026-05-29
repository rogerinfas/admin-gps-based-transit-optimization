export interface Route {
  id: string;
  code: string;
  name: string;
  outboundPath?: [number, number][];
  returnPath?: [number, number][];
}
