/**
 * author : SungYong Jang <jsy@adain.kr>
 * date : 2015. 7. 14.
 * description : meteor-command-pattern
 */
Package.describe({
  name: 'adain:meteor-command-pattern',
  summary: 'Implement command pattern using meteor collection',
  version: '1.0.0',
  git: 'https://github.com/ADAIN/meteor-command-pattern/tree/master/src/packages/adain:meteor-command-pattern'
});

Package.onUse(function (api) {
  api.versionsFrom('1.0.1');

  api.use(['tracker', 'underscore', 'templating', 'session', 'jquery'], 'client');

  api.use([
    'minimongo',
    'mongo',
    'adain:classjs@1.0.3',
    'adain:meteor-guid@1.0.1',
    'accounts-base'
  ], ['client', 'server']);

  api.addFiles('lib/collections/CommandCollection.js', ['client', 'server']);

  api.addFiles('lib/client/classes/Command.js', 'client');
  api.addFiles('lib/client/classes/CommandStack.js', 'client');

  api.addFiles('lib/server/command_publication.js', 'server');

  api.export('CommandCollection', ['client', 'server']);

  api.export('Command', 'client');
  api.export('CommandStack', 'client');

});