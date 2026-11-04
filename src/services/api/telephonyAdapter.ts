import { Linking } from 'react-native';

/**
 * Mobile Telephony & Call Masking Adapter
 */

export interface PhoneCallParams {
  recipientName: string;
  recipientPhone: string;
  isMasked?: boolean;
}

export async function initiateDirectOrMaskedCall(params: PhoneCallParams): Promise<boolean> {
  // If masked number is supported, we route via cloud PBX virtual number
  const targetNumber = params.isMasked ? '+918047192300' : params.recipientPhone;
  const url = `tel:${targetNumber}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[TelephonyAdapter] Could not dial number:', err);
    return false;
  }
}

