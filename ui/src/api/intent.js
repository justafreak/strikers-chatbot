import { storeBotMsg } from '../stores/messages.js';
import { get } from 'svelte/store';
import { storeSessionId, sessionId } from '../stores/session.js';
import { MSG_TYPE_TEXT } from '../constants/msgType.js';
import { INTENT_PATH } from '../constants/paths.js';
import { switchTypingIndicator } from '../stores/chat';
import { waitUntil } from '../utils/utils';
import { setEntities } from '../stores/recommendation';

export const detectIntent = async requestData => {
  const body = { message: requestData, sessionId: get(sessionId) };

  const headers = new Headers({
    'Content-Type': 'application/json',
    charset: 'utf-8'
  });

  try {
    switchTypingIndicator(true);
    await waitUntil(1500);
    const response = await fetch(INTENT_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const resp = await response.json();
    const msgs = [].concat(resp.message);

    switchTypingIndicator(false);

    msgs.forEach(msg => {
      const msgType = msg.type;
      const type = msgType ? msgType.toUpperCase() : MSG_TYPE_TEXT;
      storeBotMsg(type, msg.reply);
    });

    if (resp.parameters) setEntities(resp.parameters);

    storeSessionId(resp.sessionId);
  } catch (e) {
    storeBotMsg(MSG_TYPE_TEXT, 'Woops');
  }
};
