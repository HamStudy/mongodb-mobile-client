
import { MongoDBMobileSource, MongoMobileTypes } from './definitions';

let MongoMobilePlugin: MongoDBMobileSource = null;

export function getMongoMobilePlugin() {
  return MongoMobilePlugin;
}
export function setMongoMobilePlugin(plugin: MongoDBMobileSource) {
  MongoMobilePlugin = plugin;
}

import * as Types from './types';

export * from './db';
export * from './collection';
export * from './cursor';
export * from './aggregationCursor';
export * from './bulkOps';

export {
    MongoMobileTypes, MongoDBMobileSource, Types
}