import nodemailer from 'nodemailer';

const FROM = 'ECM Kalibrlash <ecm.calibration.llc@gmail.com>';
const COMPANY_EMAIL = 'ecm.calibration.llc@gmail.com';

function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: COMPANY_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendApplicationConfirmation(params: {
  to: string;
  applicantName: string;
  applicationId: number;
}): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM,
    to: params.to,
    subject: `Arizangiz qabul qilindi — №${params.applicationId}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">✅ Arizangiz qabul qilindi</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        <p>
          Arizangiz muvaffaqiyatli yuborildi.
          Ariza raqami: <strong>№${params.applicationId}</strong>
        </p>
        <p>Tez orada mutaxassislarimiz siz bilan bog'lanadi.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">
          ECM Kalibrlash — kalibrlash va sertifikatlash xizmatlari
        </p>
      </div>
    `,
  });
}

export async function sendApplicationNotification(params: {
  to: string;
  applicantName: string;
  applicationId: number;
  statusLabel: string;
  message?: string;
}): Promise<void> {
  const transporter = createTransport();
  const body = params.message
    ? `<p>${params.message.replace(/\n/g, '<br/>')}</p>`
    : `<p>Ariza №<strong>${params.applicationId}</strong> holati yangilandi: <strong>${params.statusLabel}</strong></p>`;

  await transporter.sendMail({
    from: FROM,
    to: params.to,
    subject: `Ariza №${params.applicationId} — ${params.statusLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#1b4060">📋 Ariza holati haqida xabar</h2>
        <p>Hurmatli <strong>${params.applicantName}</strong>,</p>
        ${body}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:13px;color:#6b7280">
          ECM Kalibrlash — kalibrlash va sertifikatlash xizmatlari
        </p>
      </div>
    `,
  });
}
