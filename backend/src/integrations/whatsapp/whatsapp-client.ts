import { config } from '../../config/env';
import { logger } from '../../utils/logger';

export interface WhatsAppMessagePayload {
  to: string;
  templateName: string;
  language?: string;
  components?: any[];
  textFallback?: string;
}

export class WhatsAppClient {
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = config.whatsapp.accessToken;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.apiUrl = `https://graph.facebook.com/${config.whatsapp.apiVersion}/${this.phoneNumberId}/messages`;
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  /**
   * Send WhatsApp message via official Cloud API, or simulate locally if credentials are mock/missing
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<{ success: boolean; messageId: string; response?: any }> {
    const formattedPhone = payload.to.replace(/[^0-9]/g, '');

    if (!this.isConfigured()) {
      logger.info(`[WHATSAPP MOCK SIMULATOR] Dispatching notification to +${formattedPhone}:`, {
        template: payload.templateName,
        fallbackText: payload.textFallback,
      });

      return {
        success: true,
        messageId: `wamid.mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        response: { status: 'mock_delivered', simulated: true },
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'template',
          template: {
            name: payload.templateName,
            language: { code: payload.language || 'en' },
            components: payload.components || [],
          },
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'WhatsApp sending failed');
      }

      const messageId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
      logger.info(`WhatsApp Cloud API message dispatched successfully: ${messageId}`);
      return {
        success: true,
        messageId,
        response: data,
      };
    } catch (error: any) {
      logger.error('WhatsApp Cloud API dispatch error:', error?.message);
      throw error;
    }
  }
}

export const whatsAppClient = new WhatsAppClient();
