import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '1時間あたりの分析上限に達しました。しばらくお待ちください。' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { keyword, lang } = body as { keyword?: string; lang?: string };
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0 || keyword.length > 120) {
      return NextResponse.json({ error: '無効なキーワードです' }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are a YouTube niche strategy expert. Analyze market demand and competition levels accurately and specifically. Return ONLY valid JSON as specified — no extra keys, no extra text.',
        },
        {
          role: 'user',
          content: `Analyze this YouTube niche: "${keyword.trim()}"
${lang === 'en' ? 'Write all text fields in English.' : 'すべてのテキスト項目は日本語で記述してください。'}
Return exactly this JSON object (no other text):
{
  "demand_score": <integer 1-10, audience demand size>,
  "supply_score": <integer 1-10, 10 = maximum saturation/competition>,
  "opportunity_score": <integer 1-10, overall entry opportunity>,
  "verdict": <exactly one of: "今すぐ参入" "差別化参入" "慎重に参入" "参入困難">,
  "demand_reason": "<why this demand score, max 52 chars>",
  "supply_reason": "<why this supply score, max 52 chars>",
  "insight": "<specific actionable insight, max 105 chars>",
  "winning_angles": ["<strategy 1, max 68 chars>","<strategy 2, max 68 chars>","<strategy 3, max 68 chars>"],
  "risk": "<primary risk, max 72 chars>"
}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response');
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json(
      { error: '分析中にエラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
