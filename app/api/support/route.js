import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { naam, email, bericht } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!naam || !email || !bericht) {
      return NextResponse.json({ error: 'Alle velden zijn verplicht.' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'TrackMijnBets Support <onboarding@resend.dev>',
      to: 'lucas@mybuqo.com',
      replyTo: email,
      subject: `Support aanvraag van ${naam}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #334155; margin-bottom: 4px;">Nieuw supportbericht</h2>
          <p style="color: #64748b; margin-top: 0; font-size: 14px;">Via TrackMijnBets — support formulier</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 80px;">Naam</td>
              <td style="padding: 6px 0; font-weight: 600;">${naam}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">E-mail</td>
              <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

          <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Bericht:</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${bericht}</div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            Stuur een reply naar dit e-mailadres om direct te antwoorden: ${email}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Verzenden mislukt. Probeer het opnieuw.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Support route error:', err);
    return NextResponse.json({ error: 'Er is een fout opgetreden.' }, { status: 500 });
  }
}
