import { createServer } from './server/server';
import { IConfig } from './types';

export async function dev(opts: IConfig) {
  // TODO: implement dev mode
  await createServer(opts);
}
