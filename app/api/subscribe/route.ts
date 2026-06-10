import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: '無効なメールアドレスです' }, { status: 400 });
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: email.trim(),
        groups: [process.env.MAILERLITE_GROUP_ID],
      }),
    });

    // 409 = already subscribed, treat as success
    if (!response.ok && response.status !== 409) {
      throw new Error('MailerLite API error');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: '登録に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
