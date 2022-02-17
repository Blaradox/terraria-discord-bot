#!/usr/bin/env node

import Discord from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

const client = new Discord.Client({intents: ["GUILD_MESSAGES"]});

client.login(process.env.BOT_TOKEN);
