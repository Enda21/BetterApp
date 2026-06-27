import { Alert, InteractionManager, Linking } from 'react-native';
import * as MailComposer from 'expo-mail-composer';

const SKOOL_SUPPORT_EMAIL = 'help@skool.com';
const SUBJECT = 'Account Deletion Request';
const BODY =
  'Hi Skool Support,\n\nI would like to request the complete deletion of my Skool account and all associated data.\n\nThank you.';

async function openMailto(): Promise<boolean> {
  const url =
    `mailto:${SKOOL_SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(SUBJECT)}` +
    `&body=${encodeURIComponent(BODY)}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export async function requestSkoolAccountDeletion(): Promise<void> {
  const isAvailable = await MailComposer.isAvailableAsync();

  if (isAvailable) {
    try {
      await MailComposer.composeAsync({
        recipients: [SKOOL_SUPPORT_EMAIL],
        subject: SUBJECT,
        body: BODY,
      });
      return;
    } catch {
      // fall through to mailto
    }
  }

  const opened = await openMailto();
  if (!opened) {
    Alert.alert(
      'Email Not Available',
      `Please send an email to ${SKOOL_SUPPORT_EMAIL} requesting account deletion.`,
      [{ text: 'OK' }]
    );
  }
}

export function requestSkoolAccountDeletionAfterModal(onClose: () => void): void {
  onClose();
  InteractionManager.runAfterInteractions(() => {
    requestSkoolAccountDeletion();
  });
}
