import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

async function generateReport(keyword: string, scores: {
  demand: number; supply: number; opportunity: number; verdict: string;
}): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 1200,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'あなたはYouTubeチャンネル戦略の専門家です。日本語で分析レポートを作成してください。JSONのみ返してください。',
      },
      {
        role: 'user',
        content: `「${keyword}」ジャンルのYouTube参入分析レポートを作成してください。
スコア情報: 需要${scores.demand}/10, 競合密度${scores.supply}/10, 機会${scores.opportunity}/10, 判定: ${scores.verdict}

以下のJSON形式で返してください:
{
  "summary": "<このジャンルの市場概要 100字>",
  "target_audience": "<具体的なターゲット視聴者像 80字>",
  "competitor_analysis": "<競合チャンネルの傾向と弱点 120字>",
  "strategies": ["<具体的な差別化戦略1 80字>", "<戦略2 80字>", "<戦略3 80字>", "<戦略4 80字>", "<戦略5 80字>"],
  "content_ideas": ["<具体的な動画企画アイデア1>", "<アイデア2>", "<アイデア3>"],
  "thumbnail_tips": "<サムネイル設計のポイント 100字>",
  "first_steps": "<今すぐ始めるべき最初の3ステップ 120字>"
}`,
      },
    ],
  });
  return completion.choices[0]?.message?.content || '{}';
}

function buildEmailHtml(keyword: string, report: {
  summary: string;
  target_audience: string;
  competitor_analysis: string;
  strategies: string[];
  content_ideas: string[];
  thumbnail_tips: string;
  first_steps: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#0F172A;border-radius:12px;padding:24px;margin-bottom:16px;text-align:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">FuuTen 分析レポート</div>
    <div style="font-size:22px;font-weight:500;color:white;margin-bottom:4px">「${keyword}」</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.5)">YouTubeジャンル詳細分析</div>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px">市場概要</div>
    <div style="font-size:13px;color:#334155;line-height:1.7">${report.summary}</div>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px">ターゲット視聴者</div>
    <div style="font-size:13px;color:#334155;line-height:1.7">${report.target_audience}</div>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px">競合分析</div>
    <div style="font-size:13px;color:#334155;line-height:1.7">${report.competitor_analysis}</div>
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px">差別化戦略 5選</div>
    ${report.strategies.map((s, i) => `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #F1F5F9;align-items:flex-start"><div style="width:20px;height:20px;border-radius:50%;background:#EFF6FF;color:#1D4ED8;font-size:11px;font-weight:500;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${i + 1}</div><div style="font-size:13px;color:#1E293B;line-height:1.6">${s}</div></div>`).join('')}
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:12px">動画企画アイデア</div>
    ${report.content_ideas.map(idea => `<div style="padding:6px 0;border-bottom:1px solid #F8FAFC;font-size:13px;color:#334155">・${idea}</div>`).join('')}
  </div>
  <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;border:1px solid #E2E8F0">
    <div style="font-size:10px;font-weight:500;color:#94A3B8;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px">サムネイル設計のポイント</div>
    <div style="font-size:13px;color:#334155;line-height:1.7">${report.thumbnail_tips}</div>
  </div>
  <div style="background:#ECFDF5;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #6EE7B7">
    <div style="font-size:10px;font-weight:500;color:#065F46;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px">今すぐ始める3ステップ</div>
    <div style="font-size:13px;color:#064E3B;line-height:1.7">${report.first_steps}</div>
  </div>
  <div style="background:#0F172A;border-radius:12px;padding:24px;text-align:center">
    <div style="font-size:15px;font-weight:500;color:white;margin-bottom:6px">さらに深く分析したい方へ</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:16px">競合チャンネル10社の詳細スコア・台本設計テンプレート・<br>3ヶ月チャンネル成長ロードマップを含む完全版レポート</div>
    <a href="STRIPE_PAYMENT_LINK_HERE" style="display:inline-block;background:#F59E0B;color:#78350F;font-size:13px;font-weight:500;padding:12px 28px;border-radius:8px;text-decoration:none">完全レポートを購入する（¥1,980）</a>
    <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:12px">買い切り・返金保証あり</div>
  </div>
  <div style="text-align:center;margin-top:20px;font-size:11px;color:#CBD5E1">FuuTen · YouTubeジャンル需給分析ツール</div>
</div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: '送信上限に達しました。しばらくお待ちください。' }, { status: 429 });
    }

    const body = await request.json();
    const { email, keyword, result } = body as {
      email?: string;
      keyword?: string;
      result?: { demand_score: number; supply_score: number; opportunity_score: number; verdict: string };
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '無効なメールアドレスです' }, { status: 400 });
    }
    if (!keyword || !result) {
      return NextResponse.json({ error: 'キーワード情報がありません' }, { status: 400 });
    }

    // 1. MailerLiteに登録
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}` },
      body: JSON.stringify({ email, groups: [process.env.MAILERLITE_GROUP_ID] }),
    });
    if (!mlRes.ok && mlRes.status !== 409) console.error('MailerLite error:', mlRes.status);

    // 2. レポートをAI生成
    const reportJson = await generateReport(keyword, {
      demand: result.demand_score,
      supply: result.supply_score,
      opportunity: result.opportunity_score,
      verdict: result.verdict,
    });
    const report = JSON.parse(reportJson);

    // 3. Brevoでメール送信
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'FuuTen', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: `「${keyword}」YouTubeジャンル詳細分析レポート`,
        htmlContent: buildEmailHtml(keyword, report),
      }),
    });

    if (!brevoRes.ok) {
      const errBody = await brevoRes.json();
      console.error('Brevo error:', errBody);
      throw new Error('メール送信に失敗しました');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: '送信に失敗しました。もう一度お試しください。' }, { status: 500 });
  }
}