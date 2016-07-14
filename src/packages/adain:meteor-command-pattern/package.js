/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : meteor-command-pattern
 */
Package.describe({
  name: 'adain:meteor-command-pattern',
  summary: 'Implement command pattern using meteor collection',
  version: '3.0.0',
  git: 'https://github.com/ADAIN/meteor-command-pattern/tree/master/src/packages/adain:meteor-command-pattern'
});

Package.onUse(function (api) {
  api.versionsFrom('1.3.1');

  api.use([
    'jquery@1.11.4',
    'tracker@1.0.9',
    'underscore@1.0.4',
    'templating@1.1.5',
    'session@1.1.1',
    'minimongo@1.0.10',
    'mongo@1.1.3',
    'adain:meteor-guid@1.0.1',
    'accounts-base@1.2.2',
    'reactive-var@1.0.6',
    'check@1.1.0',
    'ecmascript@0.1.6'
  ], ['client', 'server']);
  
  api.mainModule('./lib/client/index.js', 'client');
  api.mainModule('./lib/server/index.js', 'server');
});