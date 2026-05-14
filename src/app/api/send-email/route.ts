import { NextResponse } from 'next/server';
import { sendRequisitionEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { solicitud } = body;

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud data is required' }, { status: 400 });
    }

    const info = await sendRequisitionEmail(solicitud);
    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
