// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const logger = require("./logger");
const responses = require("./responses");

const app = express();
const PORT = process.env.PORT || 3000;

const HUBSPOT_BASE_URL = "https://api.hubapi.com";
const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!HUBSPOT_TOKEN) {
  logger.error("HUBSPOT_PRIVATE_APP_TOKEN ausente no .env");
  process.exit(1);
}
const hubspotHeaders = {
  Authorization: `Bearer ${HUBSPOT_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// .env -> links
const LINKS = {
  scheduling: process.env.LINK_AGENDAMENTO,
  ebook: process.env.LINK_EBOOK,
};

// CHECKS de estado de conversas finalizadas
const conversationStates = {};
function isConversationComplete(threadId) {
  return conversationStates[threadId] === true;
}
function markConversationAsComplete(threadId) {
  conversationStates[threadId] = true;
}

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// listar todas as mensagens de um thread
async function listMessages(threadId) {
  const url = `${HUBSPOT_BASE_URL}/conversations/v3/conversations/threads/${threadId}/messages`;
  const { data } = await axios.get(url, { headers: hubspotHeaders });
  return data.results || [];
}

// extrair actorId de envio
async function deriveSenderActorId(threadId) {
  const msgs = await listMessages(threadId);
  const outgoing = msgs.find((m) => m.direction === "OUTGOING");
  if (!outgoing) throw new Error("Não foi possível derivar senderActorId");
  return outgoing.senders?.[0]?.actorId || outgoing.createdBy;
}

// buscar metadata do thread
async function getThread(threadId) {
  const url = `${HUBSPOT_BASE_URL}/conversations/v3/conversations/threads/${threadId}`;
  const { data } = await axios.get(url, { headers: hubspotHeaders });
  return data;
}

// buscar uma mensagem específica
async function getRawMessage(threadId, messageId) {
  const url = `${HUBSPOT_BASE_URL}/conversations/v3/conversations/threads/${threadId}/messages/${messageId}`;
  const { data } = await axios.get(url, { headers: hubspotHeaders });
  return data;
}

// extrair texto de um objeto de mensagem
function extractText(msg) {
  if (typeof msg.text === "string") return msg.text;
  if (msg.text?.text) return msg.text.text;
  if (msg.content?.text) return msg.content.text;
  if (msg.body?.text) return msg.body.text;
  if (Array.isArray(msg.body))
    return msg.body.map((p) => p.text || "").join("");
  return "";
}

// decide a resposta e se deve finalizar
function processMessage(rawText) {
  const norm = rawText.trim().toLowerCase();
  if (norm === "sim")
    return { replyText: responses.sim(LINKS), complete: true };
  if (norm === "não" || norm === "nao")
    return { replyText: responses.nao(LINKS), complete: true };
  return { replyText: responses.default(), complete: false };
}

// enviar reply ao thread
async function sendReply(
  threadInfo,
  threadId,
  replyText,
  incomingMsg,
  senderActorId
) {
  const recipientsPayload = incomingMsg.senders.map((s) => ({
    deliveryIdentifiers: [s.deliveryIdentifier],
    actorId: s.actorId,
    name: s.name,
    deliveryIdentifier: s.deliveryIdentifier,
    recipientField: "TO",
  }));

  const payload = {
    type: "MESSAGE",
    channelAccountId: threadInfo.originalChannelAccountId,
    senderActorId,
    channelId: threadInfo.originalChannelId,
    recipients: recipientsPayload,
    text: replyText,
  };

  await axios.post(
    `${HUBSPOT_BASE_URL}/conversations/v3/conversations/threads/${threadId}/messages`,
    payload,
    { headers: hubspotHeaders }
  );
}

// manipulador de webhook
app.post("/webhook/hubspot", async (req, res) => {
  try {
    const ev = Array.isArray(req.body) ? req.body[0] : req.body;
    const { subscriptionType, objectId, messageId } = ev;

    if (
      !["conversation.newMessage", "conversation.message.creation"].includes(
        subscriptionType
      ) ||
      !messageId
    ) {
      return res.sendStatus(200);
    }

    const threadId = String(objectId).split(":")[0];
    if (isConversationComplete(threadId)) return res.sendStatus(200);

    const threadInfo = await getThread(threadId);
    const senderActorId = await deriveSenderActorId(threadId);
    const msgData = await getRawMessage(threadId, messageId);

    if (msgData.direction !== "INCOMING") return res.sendStatus(200);

    const rawText = extractText(msgData);
    const { replyText, complete } = processMessage(rawText);

    await sendReply(threadInfo, threadId, replyText, msgData, senderActorId);

    if (complete) markConversationAsComplete(threadId);

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

// endpoints de saúde e status
app.get("/health", (_, res) =>
  res.json({ status: "OK", time: new Date().toISOString() })
);
app.get("/", (_, res) =>
  res.json({ service: "HubSpot WhatsApp Bot", version: "1.0.0" })
);

app.listen(PORT, () => logger.info(`Bot rodando na porta ${PORT}`));
