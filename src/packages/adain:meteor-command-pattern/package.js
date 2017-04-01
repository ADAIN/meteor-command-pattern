/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : meteor-command-pattern
 */
Package.describe({
  name: 'adain:meteor-command-pattern',
  summary: 'Implement command pattern using meteor collection',
  version: '5.0.2',
  git: 'https://github.com/ADAIN/meteor-command-pattern/tree/master/src/packages/adain:meteor-command-pattern'
});

Package.onUse(function (api) {
  api.versionsFrom('1.4.3.2');

  api.use([
    'jquery@1.11.10',
    'tracker@1.1.2',
    'underscore@1.0.10',
    'templating@1.3.0',
    'session@1.1.7',
    'minimongo@1.0.21',
    'mongo@1.1.16',
    'accounts-base@1.2.15',
    'reactive-var@1.0.11',
    'check@1.2.5',
    'ecmascript@0.6.3'
  ], ['client', 'server']);
  
  api.mainModule('./lib/client/index.js', 'client');
  api.mainModule('./lib/server/index.js', 'server');
});