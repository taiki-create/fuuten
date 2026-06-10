'use client';

import './globals.css';
import { useState } from 'react';

type Result = {
  demand_score: number;
  supply_score: number;
  opportunity_score: number;
  verdict: string;
  demand_reason: string;
  supply_reason: string;
  insight: string;
  winning_angles: string[];
  risk: string;
};

type Lang = 'ja' | 'en';

const T = {
  ja: {
    tagline: 'YouTubeジャンル需給分析',
    sub: 'AIが需要と競合を即分析。参入判断をデータで。',
    placeholder: '例：英語学習、ガジェットレビュー、料理 vlog',
    analyze: '分析する',
    analyzing: '分析中…',
    demand: '需要',
    supply: '競合',
    opportunity: '参入機会',
    insightTitle: 'インサイト',
    anglesTitle: '勝ち筋',
    riskTitle: '主なリスク',
    hint: 'キーワードを入力して参入機会をチェック',
    examples: ['英語学習', 'ガジェットレビュー', '節約・貯金', 'ペット'],
  },
  en: {
    tagline: 'YouTube Niche Supply & Demand',
    sub: 'AI scores demand and competition instantly. Decide with data.',
    placeholder: 'e.g. language learning, gadget reviews, cooking vlog',
    analyze: 'Analyze',
    analyzing: 'Analyzing…',
    demand: 'Demand',
    supply: 'Competition',
    opportunity: 'Opportunity',
    insightTitle: 'Insight',
    anglesTitle: 'Winning angles',
    riskTitle: 'Primary risk',
    hint: 'Enter a keyword to check your entry opportunity',
    examples: ['language learning', 'gadget reviews', 'personal finance', 'pets'],
  },
};

const VERDICT_STYLE: Record<string, { bg: string; fg: string }> = {
  今すぐ参入: { bg: '#DCFCE7', fg: '#166534' },
  差別化参入: { bg: '#DBEAFE', fg: '#1E40AF' },
  慎重に参入: { bg: '#FEF3C7', fg: '#92400E' },
  参入困難: { bg: '#FEE2E2', fg: '#991B1B' },
};

function scoreColor(score: number, invert = false) {
  const s = invert ? 11 - score : score;
  if (s >= 7) return '#16A34A';
  if (s >= 4) return '#D97706';
  return '#DC2626';
}

function ScoreBar({
  label,
  reason,
  score,
  invert = false,
}: {
  label: string;
  reason: string;
  score: number;
  invert?: boolean;
}) {
  const color = scoreColor(score, invert);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 15, color }}>{score}/10</span>
      </div>
      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score * 10}%`,
            background: color,
            borderRadius: 99,
            transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{reason}</p>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>('ja');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const t = T[lang];

  async function analyze(kw?: string) {
    const q = (kw ?? keyword).trim();
    if (!q || loading) return;
    if (kw) setKeyword(kw);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: q, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
      } else {
        setResult(data as Result);
      }
    } catch {
      setError(lang === 'ja' ? '通信エラーが発生しました' : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  const vStyle = result ? VERDICT_STYLE[result.verdict] ?? { bg: '#E2E8F0', fg: '#334155' } : null;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', color: '#0F172A' }}>
            風天<span style={{ fontSize: 18, color: '#94A3B8', marginLeft: 10 }}>FuuTen</span>
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', padding: 3, borderRadius: 99 }}>
            {(['ja', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '5px 12px',
                  borderRadius: 99,
                  background: lang === l ? '#fff' : 'transparent',
                  color: lang === l ? '#0F172A' : '#94A3B8',
                  boxShadow: lang === l ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {l === 'ja' ? '日本語' : 'EN'}
              </button>
            ))}
          </div>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 500, color: '#334155' }}>{t.tagline}</p>
        <p style={{ margin: '0 0 28px', fontSize: 13.5, color: '#94A3B8', lineHeight: 1.5 }}>{t.sub}</p>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder={t.placeholder}
            maxLength={120}
            style={{
              flex: 1,
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 15,
              fontFamily: 'inherit',
              outline: 'none',
              background: '#fff',
              color: '#0F172A',
            }}
          />
          <button
            onClick={() => analyze()}
            disabled={loading || !keyword.trim()}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '0 22px',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: loading || !keyword.trim() ? 'default' : 'pointer',
              background: loading || !keyword.trim() ? '#CBD5E1' : '#0F172A',
              color: '#fff',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
          >
            {loading ? t.analyzing : t.analyze}
          </button>
        </div>

        {/* Example chips */}
        {!result && !loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {t.examples.map((ex) => (
              <button
                key={ex}
                onClick={() => analyze(ex)}
                style={{
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  borderRadius: 99,
                  padding: '6px 13px',
                  fontSize: 12.5,
                  fontFamily: 'inherit',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              background: '#FEE2E2',
              color: '#991B1B',
              borderRadius: 12,
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginTop: 28, textAlign: 'center', color: '#94A3B8', fontSize: 13.5 }}>
            {t.analyzing}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: 24 }}>
            {/* Opportunity headline */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 24,
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>{t.opportunity}</div>
                {vStyle && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 14px',
                      borderRadius: 99,
                      fontSize: 14,
                      fontWeight: 500,
                      background: vStyle.bg,
                      color: vStyle.fg,
                    }}
                  >
                    {result.verdict}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 48,
                  lineHeight: 1,
                  color: scoreColor(result.opportunity_score),
                }}
              >
                {result.opportunity_score}
                <span style={{ fontSize: 20, color: '#CBD5E1' }}>/10</span>
              </div>
            </div>

            {/* Demand & supply */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <ScoreBar label={t.demand} reason={result.demand_reason} score={result.demand_score} />
              <ScoreBar label={t.supply} reason={result.supply_reason} score={result.supply_score} invert />
            </div>

            {/* Insight */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                {t.insightTitle}
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: '#0F172A', lineHeight: 1.6 }}>{result.insight}</p>
            </div>

            {/* Winning angles */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                {t.anglesTitle}
              </div>
              {result.winning_angles?.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i === result.winning_angles.length - 1 ? 0 : 12 }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: 99,
                      background: '#0F172A',
                      color: '#fff',
                      fontSize: 12,
                      fontFamily: "'DM Mono',monospace",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.5 }}>{a}</p>
                </div>
              ))}
            </div>

            {/* Risk */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                ⚠ {t.riskTitle}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#7C2D12', lineHeight: 1.6 }}>{result.risk}</p>
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <p style={{ textAlign: 'center', color: '#CBD5E1', fontSize: 13, marginTop: 40 }}>{t.hint}</p>
        )}
      </div>
    </main>
  );
}
