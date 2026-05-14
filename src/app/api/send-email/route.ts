import { NextResponse } from 'next/server';
import { sendRequisitionEmail } from '@/lib/email-service';
import { generateRequisitionPDF } from '@/lib/pdf-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { solicitud } = body;

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud data is required' }, { status: 400 });
    }

    console.log('--- Iniciando Proceso de Envío ---');
    console.log('Solicitud ID:', solicitud.solicitudId || solicitud.id);

    // 1. Generar el PDF
    let attachment = undefined;
    try {
      // Intentamos generar el PDF. 
      // Nota: generateRequisitionPDF en el cliente descarga el archivo, 
      // pero aquí necesitamos el objeto doc para obtener el output.
      const doc = generateRequisitionPDF(solicitud);
      if (doc && doc.output) {
        const pdfArrayBuffer = doc.output('arraybuffer');
        attachment = {
          filename: `Requisicion_${solicitud.solicitudId || solicitud.id}.pdf`,
          content: Buffer.from(pdfArrayBuffer)
        };
        console.log('✅ PDF generado con éxito');
      }
    } catch (pdfError) {
      console.error('⚠️ No se pudo generar el PDF para el adjunto:', pdfError);
      // Continuamos sin adjunto si falla la generación para no bloquear el correo
    }

    // 2. Enviar el Email
    const result = await sendRequisitionEmail(solicitud, attachment);

    return NextResponse.json({ 
      success: true, 
      messageId: result.message,
      hasAttachment: !!attachment 
    });
  } catch (error: any) {
    console.error('❌ Error crítico en API send-email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error.message 
    }, { status: 500 });
  }
}
