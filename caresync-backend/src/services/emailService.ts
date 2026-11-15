import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
  },
});

export interface ReminderEmailOptions {
  to: string | string[];
  patientName: string;
  type: 'medication' | 'missed_medication' | 'appointment' | 'sos';
  details: {
    medicationName?: string;
    dosage?: string;
    scheduledTime?: string;
    appointmentDate?: string;
    doctorName?: string;
    location?: string;
    sosMessage?: string;
  };
}

export async function sendReminderEmail(options: ReminderEmailOptions): Promise<void> {
  const { to, patientName, type, details } = options;

  let subject = '';
  let html = '';

  const baseStyle = `
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;
  const headerStyle = `
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: white;
    padding: 24px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  `;
  const bodyStyle = `
    background: #F8FAFC;
    padding: 24px;
    border-radius: 0 0 12px 12px;
    border: 1px solid #E2E8F0;
  `;

  switch (type) {
    case 'medication':
      subject = `💊 Medication Reminder — ${patientName}`;
      html = `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="margin:0;font-size:24px;">💊 Medication Reminder</h1>
            <p style="margin:8px 0 0;opacity:0.9;">CareSync Health Platform</p>
          </div>
          <div style="${bodyStyle}">
            <h2 style="color:#1E293B;">Time for ${patientName}'s medication</h2>
            <div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #2563EB;margin:16px 0;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1E293B;">${details.medicationName}</p>
              <p style="margin:4px 0;color:#64748B;">${details.dosage}</p>
              <p style="margin:4px 0;color:#64748B;">Scheduled: ${details.scheduledTime}</p>
            </div>
            <p style="color:#64748B;font-size:14px;">Please ensure ${patientName} takes their medication on time.</p>
            <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Sent by CareSync • Reply to unsubscribe</p>
          </div>
        </div>`;
      break;

    case 'missed_medication':
      subject = `🚨 MISSED MEDICATION ALERT — ${patientName}`;
      html = `
        <div style="${baseStyle}">
          <div style="${headerStyle.replace('#2563EB', '#DC2626').replace('#3B82F6', '#EF4444')}">
            <h1 style="margin:0;font-size:24px;">⚠️ Missed Medication Alert</h1>
            <p style="margin:8px 0 0;opacity:0.9;">CareSync Health Platform</p>
          </div>
          <div style="${bodyStyle}">
            <h2 style="color:#DC2626;">${patientName} missed a medication!</h2>
            <div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #DC2626;margin:16px 0;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1E293B;">${details.medicationName}</p>
              <p style="margin:4px 0;color:#64748B;">${details.dosage}</p>
              <p style="margin:4px 0;color:#DC2626;">Was scheduled: ${details.scheduledTime}</p>
            </div>
            <p style="color:#1E293B;font-weight:bold;">Action Required: Please check on ${patientName} immediately.</p>
            <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Sent by CareSync • Reply to unsubscribe</p>
          </div>
        </div>`;
      break;

    case 'appointment':
      subject = `📅 Appointment Reminder — ${patientName}`;
      html = `
        <div style="${baseStyle}">
          <div style="${headerStyle.replace('#2563EB', '#7C3AED').replace('#3B82F6', '#8B5CF6')}">
            <h1 style="margin:0;font-size:24px;">📅 Appointment Reminder</h1>
            <p style="margin:8px 0 0;opacity:0.9;">CareSync Health Platform</p>
          </div>
          <div style="${bodyStyle}">
            <h2 style="color:#1E293B;">${patientName} has an upcoming appointment</h2>
            <div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #7C3AED;margin:16px 0;">
              <p style="margin:0;font-size:18px;font-weight:bold;color:#1E293B;">Dr. ${details.doctorName}</p>
              <p style="margin:4px 0;color:#64748B;">📅 ${details.appointmentDate}</p>
              <p style="margin:4px 0;color:#64748B;">📍 ${details.location}</p>
            </div>
            <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Sent by CareSync • Reply to unsubscribe</p>
          </div>
        </div>`;
      break;

    case 'sos':
      subject = `🆘 EMERGENCY SOS ALERT — ${patientName}`;
      html = `
        <div style="${baseStyle}">
          <div style="${headerStyle.replace('#2563EB', '#B91C1C').replace('#3B82F6', '#DC2626')}">
            <h1 style="margin:0;font-size:28px;">🆘 EMERGENCY SOS</h1>
            <p style="margin:8px 0 0;opacity:0.9;">CareSync Health Platform</p>
          </div>
          <div style="${bodyStyle}">
            <h2 style="color:#B91C1C;font-size:22px;">URGENT: ${patientName} needs help!</h2>
            <div style="background:#FEF2F2;padding:16px;border-radius:8px;border:2px solid #DC2626;margin:16px 0;">
              <p style="margin:0;font-size:16px;color:#1E293B;">${details.sosMessage || 'Emergency SOS activated'}</p>
              <p style="margin:8px 0 0;color:#DC2626;font-weight:bold;">Time: ${new Date().toLocaleString()}</p>
            </div>
            <p style="color:#B91C1C;font-weight:bold;font-size:16px;">PLEASE RESPOND IMMEDIATELY</p>
            <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Sent by CareSync Emergency System</p>
          </div>
        </div>`;
      break;
  }

  await transporter.sendMail({
    from: `"CareSync 🏥" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  });

  console.log(`📧 Email sent: ${type} to ${to}`);
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    console.error('Email connection failed');
    return false;
  }
}
