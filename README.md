# HubSpot WhatsApp Bot

A lightweight Node.js service that automatically responds to WhatsApp template messages in HubSpot conversations. When users respond with "Sim" or "Não" to template messages, the bot sends appropriate follow-up responses with relevant links.

This project is exeperimental and it is intended to be used as a demonstration prototype, the code is a little messy lol but it works!

## 🎯 Overview

This service listens for HubSpot message.creation webhooks and processes WhatsApp template responses:

- **"Sim"** → Thank you + scheduling link for virtual pharmacy consultation
- **"Não"** → Thank you + exclusive eBook download link
- **Other responses** → Polite request to use "Yes" or "No" (in this project I used the Portuguese version of these two)

## 🏗️ Architecture

WhatsApp Template → HubSpot Inbox → Webhook → Node.js Service → HubSpot API → Reply

### Components

- **server.js** - Main Express server with webhook handling
- **responses.js** - Modular response templates
- **HubSpot API Integration** - Thread fetching, message processing, reply sending
- **Environment Configuration** - Secure token and link management
