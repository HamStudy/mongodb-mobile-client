import { MongoMobileTypes } from './definitions';
import { Collection } from './collection';
import { IteratorCallback } from './commonTypes';
import { getMongoMobilePlugin, CursorResult } from './index';
import { 
  BaseCursor
} from './baseCursor';

import {
  encodeExtendedJson
} from './types/extendedJson';

class AggregationCursor<T extends Object> extends BaseCursor<T> {
  protected async execute() {
    let cursorStart = await getMongoMobilePlugin().aggregate({
      db: this.collection.db.databaseName,
      collection: this.collection.collectionName,

      pipeline: encodeExtendedJson(this._pipelineStages),
      options: this.options,
      cursor: true
    });
    this.cursorId = cursorStart.cursorId;
    this.resetCloseTimer();
  }

  constructor(collection: Collection, private _pipelineStages: any[] = [], private options: MongoMobileTypes.AggregateOptions = {}) {
    super(collection);
  }

  allowDiskUse(value: boolean): AggregationCursor<T> {
    this.options.allowDiskUse = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#batchSize */
  batchSize(value: number): AggregationCursor<T> {
    this.errorIfClosed();
    if (value < 1) { throw new Error("batchSize must be at least 1"); }
    this.options.batchSize = value;
    this._cursorBatchSize = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#clone */
  clone(): AggregationCursor<T> {
    let nc = new AggregationCursor<T>(this.collection, this._pipelineStages);
    nc.options = this.options;
    nc._asyncTimeoutMs = this._asyncTimeoutMs;
    return nc;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#collation */
  collation(value: MongoMobileTypes.Collation): AggregationCursor<T> {
    this.options.collation = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#explain */
  explain(): Promise<CursorResult> {
    throw new Error("Not implemented!");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#each */
  each(iterator: IteratorCallback<T>) : Promise<void> {
    return this.forEach(iterator);
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#hasNext */
  geoNear(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $geoNear: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#group */
  group(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $group: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#limit */
  limit(value: number): AggregationCursor<T> {
    this.options.limit = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#match */
  match(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $match: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#maxTimeMS */
  maxTimeMS(value: number): AggregationCursor<T> {
    this.options.maxTimeMS = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#out */
  out(destination: string): AggregationCursor<T> {
    this._pipelineStages.push({
      $out: destination
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#project */
  project(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $project: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#redact */
  redact(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $redact: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#setEncoding */
  skip(value: number): AggregationCursor<T> {
    this._pipelineStages.push({
      $skip: value
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#sort */
  sort(document: object): AggregationCursor<T> {
    this._pipelineStages.push({
      $sort: document
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/AggregationCursor.html#unwind */
  unwind(field: string): AggregationCursor<T> {
    this._pipelineStages.push({
      $unwind: field
    });
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#maxAwaitTimeMS */
  maxAwaitTimeMS(value: number): AggregationCursor<T> {
    this._asyncTimeoutMs = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#toArray */
}

export { AggregationCursor };
