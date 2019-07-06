
import {ObjectId} from './ObjectId';

enum ExtendedTypes {
  ObjectId = "$oid",
  Binary = "$binary",
  Symbol = "$symbol",
  Int32 = "$numberInt",
  Decimal128 = "$numberDecimal",
  Double = "$numberDouble",
  Long = "$numberLong",
  MinKey = "$minKey",
  MaxKey = "$maxKey",
  BSONRegExp = "$regularExpression",
  Timestamp = "$timestamp",
  Date = "$date"
}

function isObject(val: any) {
  let type = typeof val;
  return type == 'object' || type == 'function';
}

export function encodeExtendedJson(obj: any) : any {
  if (obj === undefined || obj === null) {
    return obj;
  } else if (obj.id && obj.toHexString) {
    return {[ExtendedTypes.ObjectId]: obj.toHexString()};
  } else if (obj instanceof RegExp) {
    let strVal = obj.toString();
    let lastSlash = strVal.lastIndexOf('/');
    let regExpString = strVal.substring(1, lastSlash);
    let options = regExpString.substring(lastSlash+1);
    let out = {
      [ExtendedTypes.BSONRegExp]: regExpString,
      $options: options
    };
    return out;
  } else if (obj instanceof Date) {
    let isoStr = obj.toISOString();
    // we should only show milliseconds in timestamp if they're non-zero
    isoStr = obj.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
    return {
      [ExtendedTypes.Date]: isoStr
    };
  }

  if (Array.isArray(obj)) {
    return (<any[]>obj).map(v => encodeExtendedJson(v));
  } else if (isObject(obj)) {
    let outObj: typeof obj = {};
    for (let key of Object.keys(obj)) {
      outObj[key] = encodeExtendedJson(obj[key]);
    }
    return outObj;
  } else {
    // For everything else just return as-is
    return obj;
  }
}

function unknownType(type: never) { throw new Error(); }

export function decodeExtendedJson(obj: any) {
  if (obj === null || obj === void 0) { return obj; }
  if (Array.isArray(obj)) {
    return decodeExtendedJsonArray(obj);
  }
  if (typeof(obj) != 'object' && typeof(obj) != 'function') {
    return obj; // We only need to process object and array types
  }
  let keys = Object.keys(obj);
  if (keys.length == 1 && keys[0].substr(0, 1) == "$") {
    // This is likely an extended json type
    const keyType = keys[0] as ExtendedTypes;
    const val = obj[keyType];
    switch(keyType) {
      case ExtendedTypes.ObjectId:
        return new ObjectId(val as string);
      case ExtendedTypes.Int32:
        return parseInt(val, 10);
      case ExtendedTypes.Double:
        return parseFloat(val);
      case ExtendedTypes.BSONRegExp:
        return new RegExp(val as string, obj["$options"] || "");
      case ExtendedTypes.Date:
        let date = new Date();
        if (typeof val == 'string') {
          date.setTime(Date.parse(val));
        } else if (val.$numberLong) {
          date.setTime(parseInt(val.$numberLong, 10));
        } else {
          console.log("ERROR: Could not read Date value: ", val);
        }
        return date;
      case ExtendedTypes.Binary:
      case ExtendedTypes.Long:
      case ExtendedTypes.Decimal128:
      case ExtendedTypes.MaxKey:
      case ExtendedTypes.MinKey:
      case ExtendedTypes.Timestamp:
        return obj; // we're going to leave this to the user; nothing we can
                    // do to really clean it up yet. Some of these
                    // we should add support for but few are used frequently
                    // and all can be handled by the library user
      case ExtendedTypes.Symbol:
        return val;
      default:
        unknownType(keyType);
    }
  }
  let outObj: typeof obj = {};
  // If we made it this far then it's probably a "normal" object and we treat it accordingly
  for (let key of keys) {
    outObj[key] = decodeExtendedJson(obj[key]);
  }
  return outObj;
}

function decodeExtendedJsonArray(obj: any[]) : any {
  return obj.map(v => decodeExtendedJson(v));
}