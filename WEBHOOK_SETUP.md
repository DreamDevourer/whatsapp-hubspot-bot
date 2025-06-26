# HubSpot Webhook Setup with Static Ngrok Domain

## Configuration

HubSpot WhatsApp bot is now running and accessible via static ngrok domain:

- **Local Server**: `http://localhost:3000`
- **Public URL**: `https://specially-frank-herring.ngrok-free.app`
- **Webhook Endpoint**: `https://specially-frank-herring.ngrok-free.app/webhook/hubspot`

## 📋 HubSpot Webhook Configuration

### Step 1: Access HubSpot Webhook Settings

1. Log into your HubSpot account
2. Go to **Settings** → **Account Setup** → **Integrations** → **Webhooks**
3. Click **Create webhook**

### Step 2: Configure Webhook

Fill in the following details:

- **Event Type**: `conversation.newMessage` (recommended) or `conversation.message.creation`
- **Webhook URL**: `https://specially-frank-herring.ngrok-free.app/webhook/hubspot`
- **Status**: Active
- **Description**: `WhatsApp Bot - Auto Response`

**Note**: The bot now accepts both `conversation.newMessage` and `conversation.message.creation` events for maximum compatibility.

### Step 3: Test the Webhook

You can test the webhook endpoint using curl:

```bash
# Test with conversation.newMessage event
curl -X POST https://specially-frank-herring.ngrok-free.app/webhook/hubspot \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionType": "conversation.newMessage",
    "eventId": 12345,
    "occurredAt": 1640995200000,
    "objectId": "9336126552",
    "messageId": "test-message-id",
    "changeFlag": "NEW_MESSAGE"
  }'
```

## 🔧 Environment Variables

Make sure your `.env` file is configured with:

```bash
# HubSpot Private App Token (required)
HUBSPOT_PRIVATE_APP_TOKEN=your_actual_token_here

# External Links (required)
LINK_AGENDAMENTO=https://calendly.com/your-pharmacy/virtual-consultation
LINK_EBOOK=https://your-domain.com/ebook-cuidados-saude.pdf

# Server Configuration (optional)
PORT=3000
NODE_ENV=development
```

## 🧪 Testing the Complete Flow

1. **Send WhatsApp Template**: Use Meta Business Manager to send a template message
2. **User Response**: Have a user respond with "Sim" or "Não"
3. **Check HubSpot**: Verify the bot sends the appropriate follow-up message
4. **Monitor Logs**: Check the server console for processing details with timestamps

## 📊 Monitoring

### Health Check

```bash
curl https://specially-frank-herring.ngrok-free.app/health
```

### Service Info

```bash
curl https://specially-frank-herring.ngrok-free.app/
```

## 🛠️ Troubleshooting

### If webhook isn't receiving events:

1. Verify the webhook URL is correct in HubSpot
2. Check that the event type is `conversation.newMessage` or `conversation.message.creation`
3. Ensure the webhook status is "Active"

### If responses aren't being sent:

1. Check your HubSpot Private App token is valid
2. Verify the Private App has the required scopes:
   - `conversations.read`
   - `conversations.write`
   - `webhooks`
3. Check server logs for error messages with timestamps

### If ngrok tunnel is down:

```bash
# Restart ngrok with your static domain
ngrok http 3000 --domain=specially-frank-herring.ngrok-free.app
```

## 🔄 Next Steps

Once testing is complete, consider:

1. **Production Deployment**: Deploy to a cloud service (Heroku, AWS, etc.)
2. **Custom Domain**: Replace ngrok with your own domain
3. **SSL Certificate**: Ensure HTTPS is properly configured
4. **Monitoring**: Add logging and alerting services

---

**Current Status**: ✅ Ready for testing with static ngrok domain and improved event handling

# Check if services are running

curl https://specially-frank-herring.ngrok-free.app/health

# Test webhook endpoint (will show error without real HubSpot data)

curl -X POST https://specially-frank-herring.ngrok-free.app/webhook/hubspot \
 -H "Content-Type: application/json" \
 -d '{"subscriptionType": "conversation.message.creation", "objectId": "test:test"}'
