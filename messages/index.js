"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

//bot.dialog('/', function (session) {
//    session.send('你说 ' + session.message.text);
//});

//bot.dialog('/', [
//    function (session, args, next) {
//        if (!session.userData.name) {
//            session.beginDialog('/profile');
//        } else {
//            next();
//        }
//    },
//    function (session, results) {
//        session.send('Hello %s!', session.userData.name);
//    }
//]);

bot.dialog('/lookupPM2.5', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
//    function (session, results) {
//        session.userData.name = results.response;
//        session.endDialog();
//    }
    function (session, results) {
        session.send('Hello %s!', results.response);
        session.endDialog();
    }
]);

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/87bf4bf6-f5b6-4d85-8448-9e038026dc47?subscription-key=bcc4ebbbd4d84f2397f75470e433de2d&verbose=true');
var intents = new builder.IntentDialog({recognizers: [recognizer] })
               .matches('LookupPM2.5', '/lookupPM2.5')
               .onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));
bot.dialog('/', intents);

//intents.matches('LookupPM2.5', '/lookupPM2.5');
//intents.matches(/^echo/i, [
//   function (session) {
//        builder.Prompts.text(session, "What would you like me to say?");
//    },
//    function (session, results) {
//        session.send("Ok... %s", results.response);
//    }
//]);

//bot.dialog('/', new builder.IntentDialog({recognizers: [recognizer] })
//    .matches('LookupPM2.5', '/lookupPM2.5')
//   .matches(/^change/i, '/changeTask')
//   .matches(/^delete/i, '/deleteTask')
//    .onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."))
//);



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
