import nodemailer from 'nodemailer';

const getHtmlTemplate = (solicitud: any) => {
  const itemsHtml = (solicitud.items || []).map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; color: #4a5568; text-align: right;">${new Intl.NumberFormat('es-CL', { style: 'currency', currency: solicitud.moneda || 'CLP' }).format(item.estimatedCost || item.price || 0)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800; text-transform: uppercase; color: white; }
        .content { padding: 40px; }
        .info-card { background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #6366f1; }
        .info-row { margin-bottom: 10px; font-size: 14px; display: flex; }
        .label { font-weight: bold; color: #64748b; width: 140px; min-width: 140px; }
        .value { color: #1e293b; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background-color: #e0e7ff; color: #4338ca; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nueva Requisición</h1>
          <p style="margin-top: 10px; opacity: 0.8;">Solicitud de Compra Pendiente de Revisión</p>
        </div>
        <div class="content">
          <div class="info-card">
            <div style="margin-bottom: 15px;"><span class="badge">ID #${solicitud.solicitudId || solicitud.id || 'S/N'}</span></div>
            <div class="info-row"><span class="label">Solicitante:</span> <span class="value">${solicitud.solicitanteName || 'No especificado'}</span></div>
            <div class="info-row"><span class="label">Proveedor:</span> <span class="value">${solicitud.proveedor || 'No especificado'}</span></div>
            <div class="info-row"><span class="label">Centro Costos:</span> <span class="value">${solicitud.centroCostos || 'No especificado'}</span></div>
            <div class="info-row"><span class="label">Total Est.:</span> <span class="value" style="color: #059669;">${new Intl.NumberFormat('es-CL', { style: 'currency', currency: solicitud.moneda || 'CLP' }).format(solicitud.totalEstimatedCost || 0)}</span></div>
          </div>

          <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Detalle de Productos</h3>
          <table>
            <thead>
              <tr>
                <th>Producto/Servicio</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">P. Unit</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Se adjunta el documento PDF formal de esta requisición.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard/solicitudes" class="btn">Gestionar en Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Botanical Solutions - Sistema de Gestión de Compras</p>
          <p>Este es un mensaje automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendRequisitionEmail = async (solicitud: any, attachment?: { filename: string, content: Buffer | string }) => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Log de diagnóstico
  console.log('--- Preparando envío de Email ---');
  console.log('Host:', host);
  console.log('User:', user);
  console.log('Tiene adjunto:', attachment ? 'SÍ' : 'NO');

  if (!host || !user || !pass) {
    console.warn('⚠️ AVISO: Configuración SMTP incompleta. Saltando envío de correo.');
    return { success: true, message: 'simulated-id-no-config' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false // Para mayor compatibilidad
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || user,
      to: process.env.SMTP_TO || 'compras@botanicalsolutions.cl',
      subject: `📢 Nueva Requisición - ${solicitud.proveedor || 'Sin Proveedor'} - #${solicitud.solicitudId || solicitud.id || ''}`,
      html: getHtmlTemplate(solicitud),
      attachments: attachment ? [{
        filename: attachment.filename,
        content: attachment.content
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado con éxito:', info.messageId);
    return { success: true, message: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};
