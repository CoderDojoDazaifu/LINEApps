'use strict';
require('dotenv').config();

const line = require('@line/bot-sdk');
const createHandler = require("azure-function-express").createHandler;
const express = require('express');

const config = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};

const app = express();

app.get('/api/webhook', (req, res) => res.send('Hello LINE BOT!(GET)')); // ブラウザ確認用(無くても問題ない)
app.post('/api/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    // ここのif文はdeveloper consoleの"接続確認"用なので削除して問題ない
    if (req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff') {
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return;
    }

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

async function handleEvent(event) {
    switch (event.type) {
        case 'message':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: event.message.text // オウム返し
            });
        case 'follow':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'はじめまして！'
            });
        case 'unfollow':
            return Promise.resolve(null);
        case 'join':
            return Promise.resolve(null);
        case 'leave':
            return Promise.resolve(null);
        case 'postback':
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: 'ポストバック[]'
            });
        default:
            throw new Error('Unknown event');
    }
    /*
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text // オウム返し
    });
    */
}

module.exports = createHandler(app);