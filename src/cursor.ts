import { MongoMobileTypes } from './definitions';
import { Collection } from './collection';
import { IteratorCallback } from './commonTypes';
import { getMongoMobilePlugin } from './index';
export type CursorResult = object | null | boolean;

import {
  BaseCursor
} from './baseCursor';

import {
  encodeExtendedJson
} from './types/extendedJson';

export interface CursorCommentOptions {
    skip?: number;
    limit?: number;
    maxTimeMS?: number;
    hint?: string;
    readPreference?: any; // ignored
}
class Cursor<T extends Object> extends BaseCursor<T> {
  protected async execute() {
    let cursorStart = await getMongoMobilePlugin().find({
      db: this.collection.db.databaseName,
      collection: this.collection.collectionName,
      filter: encodeExtendedJson(this._filter),
      options: this.options,
      cursor: true
    });
    this.cursorId = cursorStart.cursorId;
    this.resetCloseTimer();
  }

  constructor(collection: Collection, private _filter: any = {}, private options: MongoMobileTypes.FindOptions = {}) {
    super(collection);
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#batchSize */
  batchSize(value: number): Cursor<T> {
    this.errorIfClosed();
    if (value < 1) { throw new Error("batchSize must be at least 1"); }
    this._cursorBatchSize = value; return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#clone */
  clone(): Cursor<T> {
    let nc = new Cursor<T>(this.collection, this._filter);
    nc.options = this.options;
    nc._cursorBatchSize = this._cursorBatchSize;
    nc._asyncTimeoutMs = this._asyncTimeoutMs;
    return nc;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#collation */
  collation(value: MongoMobileTypes.Collation): Cursor<T> {
    this.options.collation = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#comment */
  comment(value: string): Cursor<T> {
    this.options.comment = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#count */
  async count(applySkipLimit: boolean = false, options: CursorCommentOptions = {}): Promise<number> {
    let countOpts: MongoMobileTypes.CountOptions = {
      collation: this.options.collation,
      hint: this.options.hint,
      maxTimeMS: this.options.maxTimeMS
    };
    if (options.hint) {
      countOpts.hint = options.hint;
    }
    if (typeof options.maxTimeMS == 'number') {
      countOpts.maxTimeMS = options.maxTimeMS;
    }
    if (applySkipLimit) {
      countOpts.skip = (typeof options.skip == 'number') ? options.skip : this.options.skip;
      countOpts.limit = (typeof options.limit == 'number') ? options.limit : this.options.limit;
    }
    let res = await getMongoMobilePlugin().count({
      db: this.collection.db.databaseName,
      collection: this.collection.collectionName,
      filter: this._filter,
      options: countOpts
    });

    return res.count;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#explain */
  explain(): Promise<CursorResult> {
    throw new Error("Not implemented!");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#filter */
  filter(filter: object): Cursor<T> {
    this._filter = filter;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#forEach */
  async forEach(iterator: IteratorCallback<T>) : Promise<void> {
    this.errorIfClosed();
    let next: T;
    while (next = await this.next()) {
      iterator(next);
    }
    await this.close();
  }
  hint(hint: MongoMobileTypes.IndexHint): Cursor<T> {
    this.options.hint = hint;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#limit */
  limit(value: number): Cursor<T> {
    this.options.limit = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#max */
  max(max: object): Cursor<T> {
    this.options.max = max;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#maxAwaitTimeMS */
  maxAwaitTimeMS(value: number): Cursor<T> {
    this._asyncTimeoutMs = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#maxScan */
  maxScan(maxScan: number): Cursor<T> {
    this.options.maxScan = maxScan;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#maxTimeMS */
  maxTimeMS(value: number): Cursor<T> {
    this.options.maxTimeMS = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#min */
  min(min: object): Cursor<T> {
    this.options.min = min;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#project */
  project(value: object): Cursor<T> {
    this.options.projection = value;
    return this;
  }
  returnKey(returnKey: boolean): Cursor<T> {
    this.options.returnKey = returnKey;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#showRecordId */
  showRecordId(showRecordId: boolean): Cursor<T> {
    this.options.showRecordId = showRecordId;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#skip */
  skip(value: number): Cursor<T> {
    this.options.skip = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#snapshot */
  snapshot(snapshot: object): Cursor<T> {
    throw new Error("Not implemented");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#sort */
  sort(keyOrList: MongoMobileTypes.IndexFields): Cursor<T> {
    this.options.sort = keyOrList;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#stream */
  stream(options?: { transform?: (document: T) => any }): Cursor<T> {
    throw new Error("Not implemented");
  }
}

export {Cursor};
