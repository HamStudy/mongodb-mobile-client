Introduction
============

This package is intended to be a semi-generic client for MongoDB Mobile. Why does it need a client?
I'm so glad you asked!

MongoDB Mobile is a fantastic tool which (as of this writing) works only on iOS and Android. This
makes it one of the best options for databases on mobile platforms, but in order to use it
with mobile web applications with Cordova or Capacitor you end up needing to create an interface
which is just a little bit less-than-ideal.

This client was written to use with the [capacitor-mongodb-mobile](https://github.com/HamStudy/capacitor-mongodb-mobile)
project; it was actually included as part of the project during early development, but we quickly
realized that we'd want to be able to potentially use it with a Cordova plugin instead, or perhaps
even something which could be made to work in Electron.

Use
===

At present the only known way to use this is with the [capacitor-mongodb-mobile](https://github.com/HamStudy/capacitor-mongodb-mobile)
capacitor plugin. Install that in your Capacitor project and then you can initialize it like so:

    import { Plugins } from '@capacitor/core';
    import { MongoDBMobileSource, setMongoMobilePlugin, Db, Types } from '@hamstudy/mongodb-mobile-client';

    const MongoDBMobile = Plugins.MongoDBMobile as MongoDBMobileSource;
    setMongoMobilePlugin(MongoDBMobile);

    const dbReadyPromise = MongoDBMobile.initDb();

After that you can use the Db class as your main entrypoint:

    const myDb = new Db("myDatabase");
    const users = myDb.createCollection("users"); // 

From there you can query, insert, delete, etc etc etc. See the [Db interface](./dist/db.d.ts) and
the [Collection interface](./dist/collection.d.ts) for more information. I've tried to make this
mirror the [node-native-mongodb](http://mongodb.github.io/node-mongodb-native/3.2/) driver API
as closely as I can.

Adapting to work with other database plugins
============================================

If you want this to work with another database plugin (for example a cordova plugin, etc) you just
need to implement a wrapper layer which correctly implements the [MongoDBMobileSource](./dist/definitions.d.ts#L191)
interface. While I prefer typescript it should work fine with any database interface which uses Promises and matches
that interface.

Helping out
===========

This was created for use with our own internal projects but of course I hope it'll catch on; I'll 
try to be around (taxilian) on the [Capacitor Slack channels](https://getcapacitor.slack.com)
if anyone would like to help; even just making the docs a little more accessible would be awesome.