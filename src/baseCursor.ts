import { Collection } from './collection';
import { IteratorCallback } from './commonTypes';
import { getMongoMobilePlugin, CursorResult } from './index';
export type CursorResult = object | null | boolean;

import {
  decodeExtendedJson
} from './types/extendedJson';

const K_AUTOCLOSE_TIMEOUT = 1000 * 30; // Automatically close the cursor after 30 seconds of inactivity if it isn't closed automatically

abstract class BaseCursor<T extends Object> {
  protected cursorId: string = null;
  protected _asyncTimeoutMs = K_AUTOCLOSE_TIMEOUT;
  protected _cursorBatchSize = 1;
  protected _curBatch: T[] = [];
  protected _isEnd = false;
  protected _isClosed = false;

  protected decodeObj = decodeExtendedJson;

  protected autocloseTimer: ReturnType<typeof setTimeout> = null;

  active() { return !!this.cursorId; }
  protected resetCloseTimer() {
    if (this.autocloseTimer !== null) {
      clearTimeout(this.autocloseTimer);
    }
    this.autocloseTimer = setTimeout(() => {
      console.warn("Cursor closing due to timeout!")
      this.close();
    }, this._asyncTimeoutMs);
  }
  protected errorIfClosed() {
    if (this.isClosed()) { throw new Error("Attempting to access a closed cursor"); }
  }
  /**
   * if called on the cursor it will return raw documents instead of
   * converting the extended JSON format to "normal" objects e.g.
   * {$oid: "..."} -> ObjectId("...")
   */
  raw() {
    this.decodeObj = v => v;
    return this;
  }
  protected abstract execute() : Promise<any>;

  constructor(protected collection: Collection) {
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#close */
  async close(): Promise<CursorResult> {
    if (!this.cursorId) { return false; }
    await getMongoMobilePlugin().closeCursor({
      cursorId: this.cursorId
    });
    if (this.autocloseTimer !== null) {
      clearTimeout(this.autocloseTimer);
      this.cursorId = null;
      this.autocloseTimer = null;
    }
    this._isClosed = true;
    return true;
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
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#hasNext */
  hasNext(): Promise<boolean> {
    this.errorIfClosed();
    // TODO implement
    throw new Error("Not implemented");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#isClosed */
  isClosed() {
    return this._isClosed;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#map */
  map<U>(transform: (document: T) => U): BaseCursor<U> {
    throw new Error("Not implemented");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#maxAwaitTimeMS */
  maxAwaitTimeMS(value: number): BaseCursor<T> {
    this._asyncTimeoutMs = value;
    return this;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#next */
  async next(): Promise<T | null> {
    if (this._isClosed) {
      return null;
    }
    if (!this.cursorId){
      await this.execute();
    } else {
      this.resetCloseTimer();
    }
    if (this._curBatch.length) {
      return this._curBatch.shift();
    } else if (this._isEnd) {
      console.warn("Closing cursor");
      this.close();
      return null;
    }

    let next = await getMongoMobilePlugin().cursorGetNext<T>({
      cursorId: this.cursorId, batchSize: this._cursorBatchSize
    });
    if (next.complete) {
      this._isEnd = true;
    }
    this._curBatch = (next.results || []).map(r => this.decodeObj(r));
    
    console.log("Recursing find...", this);
    return this.next();
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#rewind */
  async rewind() {
    if (!this._isClosed) {
      this.close();
    }
    this._isClosed = false;
    this._isEnd = false;
    this._curBatch = [];
    this.cursorId = null;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#stream */
  stream(options?: { transform?: (document: T) => any }): BaseCursor<T> {
    throw new Error("Not implemented");
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#toArray */
  async toArray(): Promise<T[]> {
    this.errorIfClosed();
    let all: T[] = [];
    let next: T;
    while (next = await this.next()) {
      all.push(next);
    }
    return all;
  }
  /** http://mongodb.github.io/node-mongodb-native/3.1/api/Cursor.html#setReadPreference */
  setReadPreference(readPreference: any) {
    return this; // Total no-op since read preference is meaningless in mongodb mobile
  }
}

export {BaseCursor};
