/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : meteor-command-pattern
 */
Package.describe({
  name: 'adain:meteor-command-pattern',
  summary: 'Implement command pattern using meteor collection',
  version: '2.4.1',
  git: 'https://github.com/ADAIN/meteor-command-pattern/tree/master/src/packages/adain:meteor-command-pattern'
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');

  api.use(['tracker', 'underscore', 'templating', 'session', 'jquery', 'ecmascript'], 'client');

  api.use([
    'minimongo',
    'mongo',
    'adain:meteor-guid@1.0.1',
    'accounts-base',
    'reactive-var',
    'check'
  ], ['client', 'server']);

  api.addFiles('lib/collections/CommandCollection.js', ['client', 'server']);

  api.addFiles('lib/client/classes/Command.js', 'client');
  api.addFiles('lib/client/classes/CommandFactory.js', 'client');
  api.addFiles('lib/client/classes/CommandStack.js', 'client');

  api.addFiles('lib/server/command_publication.js', 'server');

  api.export('CommandCollection', ['client', 'server']);

  api.export('Command', 'client');
  api.export('CommandFactory', 'client');
  api.export('CommandStack', 'client');

});