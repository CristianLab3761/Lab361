import nodemailer from 'nodemailer';

export const sendRequisitionEmail = async (solicitud: any) => {
  // Verificación de configuración
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ AVISO: Configuración SMTP incompleta. Saltando envío de correo.');
    return { messageId: 'simulated-id-no-config' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Sistema Botanical" <noreply@botanicalsolutions.cl>',
    to: process.env.SMTP_TO || 'compras@botanicalsolutions.cl',
    subject: `Nueva Requisición: #${solicitud.id} - ${solicitud.solicitanteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Nueva Requisición de Materiales</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Se ha generado una nueva solicitud en el sistema que requiere su revisión.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666; width: 150px;">Nro Requisición:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">#${solicitud.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Solicitante:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${solicitud.solicitanteName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Proveedor Sugerido:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${solicitud.proveedor || 'No especificado'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Total Estimado:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #000;">
                ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: solicitud.moneda || 'CLP' }).format(solicitud.totalEstimatedCost)}
              </td>
            </tr>
          </table>

          <h3 style="margin-top: 30px; font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Detalle de Ítems:</h3>
          <ul style="padding-left: 20px; color: #555;">
            ${solicitud.items.map((item: any) => `
              <li style="margin-bottom: 5px;">
                <strong>${item.quantity}x</strong> ${item.name} 
                <span style="color: #999; font-size: 12px;">(${new Intl.NumberFormat('es-CL', { style: 'currency', currency: solicitud.moneda || 'CLP' }).format(item.estimatedCost)} c/u)</span>
              </li>
            `).join('')}
          </ul>

          <div style="margin-top: 40px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/solicitudes" 
               style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              Ver y Gestionar en Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee;">
          Este es un mensaje automático generado por el Sistema de Compras Botanical.
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
