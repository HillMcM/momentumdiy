import Postmark from 'postmark';

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  messageStream?: string;
}

function createClient(): Postmark.ServerClient | null {
  const token = process.env['POSTMARK_API_TOKEN'];
  if (!token) return null;
  try {
    return new Postmark.ServerClient(token);
  } catch {
    return null;
  }
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }>
{
  const from = process.env['POSTMARK_FROM'];
  const stream = params.messageStream || process.env['POSTMARK_MESSAGE_STREAM'] || 'outbound';
  const client = createClient();

  if (!client || !from) {
    console.warn('Postmark not configured. Skipping email send.');
    return { success: false, error: 'Postmark not configured' };
  }

  try {
    await client.sendEmail({
      From: from,
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.htmlBody || '',
      TextBody: params.textBody || '',
      MessageStream: stream,
    } as any);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send email' };
  }
}

export async function sendWelcomeEmail(to: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: 'Welcome to MomentumDIY',
    htmlBody: '<p>Welcome! Your account is ready.</p>',
    textBody: 'Welcome! Your account is ready.',
  });
}


