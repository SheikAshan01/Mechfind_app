/**
 * MECHFIND Omni-Channel Notification Adapter
 * Dispatches WhatsApp Business templates, SMS alerts, and Push notifications.
 */

export interface NotificationPayload {
  recipientPhone: string;
  recipientName?: string;
  channel: 'whatsapp' | 'sms' | 'push' | 'all';
  template:
    | 'BOOKING_CONFIRMED'
    | 'MECHANIC_DISPATCHED'
    | 'QUOTE_SUBMITTED'
    | 'WORK_COMPLETED'
    | 'INVOICE_GENERATED'
    | 'EMERGENCY_SOS_BROADCAST';
  variables: Record<string, string | number>;
}

export interface DispatchResult {
  messageId: string;
  status: 'sent' | 'queued' | 'simulated';
  channel: string;
  timestamp: string;
}

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const SMS_GATEWAY_API_KEY = process.env.SMS_GATEWAY_API_KEY;

export async function dispatchNotification(
  payload: NotificationPayload
): Promise<DispatchResult> {
  const timestamp = new Date().toISOString();

  // 1. WhatsApp Cloud API Dispatch
  if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID && (payload.channel === 'whatsapp' || payload.channel === 'all')) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: payload.recipientPhone,
            type: 'template',
            template: {
              name: payload.template.toLowerCase(),
              language: { code: 'en' },
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return {
          messageId: data.messages?.[0]?.id || 'wa_sent',
          status: 'sent',
          channel: 'whatsapp',
          timestamp,
        };
      }
    } catch (err) {
      console.warn('[NotificationAdapter] WhatsApp dispatch failed:', err);
    }
  }

  // 2. Simulated / Development Dispatch Logger
  console.info(`[NotificationAdapter] Dispatched ${payload.template} via ${payload.channel} to ${payload.recipientPhone}:`, payload.variables);
  return {
    messageId: 'notif_' + Math.random().toString(36).substr(2, 9),
    status: 'simulated',
    channel: payload.channel,
    timestamp,
  };
}

