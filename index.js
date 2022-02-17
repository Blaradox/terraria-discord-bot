#!/usr/bin/env node
// https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js
// https://stackoverflow.com/questions/38190773/node-js-monitor-file-for-changes-and-parse-them

const Discord = require('discord.js');
const fs = require('fs');
const { EOL } = require('os');
require('dotenv').config();

// main options
const logFile = 'log.txt';
const endOfLineChar = EOL;

dotenv.config();

const client = new Discord.Client({intents: ["GUILD_MESSAGES"]});
client.login(process.env.BOT_TOKEN);

let fileSize = fs.statSync(logFile).size;
fs.watchFile(logFile, (curr, prev) => {
  // check if file modified time changed
  if (curr.mtime <= prev.mtime) { return; }

  // only read unread portion of file
  const newFileSize = fs.statSync(logFile).size;
  // calculate size diff
  const sizeDiff = newFileSize - fileSize;
  // if less than zero log file was truncated since last read
  if ( sizeDiff < 0 ) {
    fileSize = 0;
    sizeDiff = newFileSize;
  }

  // create buffer to hold data to read
  const buffer = new Buffer(sizeDiff);
  // get ref to file's descriptior
  const fileDescriptor = fs.openSync(logFile, 'r');
  // synchronously read file starting from last spot
  fs.readSync(fileDescriptor, buffer, 0, sizeDiff, fileSize);
  // close file
  fs.closeSync(fileDescriptor);
  // set old file size to new size for next read
  fileSize = newFileSize;

  // parse line(s) in the buffer
  parseBuffer(buffer);
});

function stop() {
  fs.unwatchFile(logFile);
}

function parseBuffer(buffer) {
  // iterate over each line of the buffer
  buffer.toString().split(endOfLineChar).forEach(line => {
    // player "left" or "joined"
    const playerRegex = /^(.*) has (left|joined)\.$/;
    const playerPresence = line.match(playerRegex);
    if ( playerPresence.length > 0 ) {
      sendDiscordMessage(playerPresence);
    }
  });
}

function sendDiscordMessage(msg) {
  const channel = client.channels.cache.get('id');
  channel.send(msg);
}
