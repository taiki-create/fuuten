'use client';

import { useState, useEffect, useRef } from 'react';

interface Result {
  demand_score: number;
  supply_score: number;
  opportunity_score: number;
  verdict: string;
  demand_reason: string;
  supply_reason: string;
  insight: string;
  winning_angles: string[];
  risk: string;
}

const VERDICTS: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  '今すぐ参入': { bg: '#ECFDF5', color: '#064E3B', border: '#34D399', dot: '#10B981' },
  '差別化参入': { bg: '#FFFBEB', color: '#78350F', border: '#FCD34D', dot: '#F59E0B' },
  '慎重に参入': { bg: '#FFF7ED', color: '#7C2D12', border: '#FDBA74', dot: '#EA580C' },
  '参入困難':   { bg: '#FEF2F2', color: '#7F1D1D', border: '#FCA5A5', dot: '#EF4444' },
};
const sc = (s: number) => (s >= 7 ? '#10B981' : s >= 5 ? '#F59E0B' : '#EF4444');
const supc = (s: number) => (s >= 8 ? '#EF4444' : s >= 5 ? '#F59E0B' : '#10B981');

const EX_JP = ['英語学習', 'ペット', '筋トレ', '副業・投資', '税理士', '料理・レシピ', 'キャンプ'];
const EX_EN = ['personal finance', 'fitness coaching', 'pet care', 'travel vlog', 'cooking'];
const STEPS_JP = ['市場規模を調査中…', '競合チャンネルをスキャン中…', '需給バランスを計算中…', '戦略レポートを生成中…'];
const STEPS_EN = ['Analyzing market size…', 'Scanning competitors…', 'Calculating demand/supply…', 'Generating strategy report…'];

function Ring({ score }: { score: number }) {
  const [active, setActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setActive(true), 120); return () => clearTimeout(t); }, []);
  const r = 34, c2 = 2 * Math.PI * r, dash = active ? (score / 10) * c2 : 0, col = sc(score);
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" style={{ display: 'block' }}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="#F1F5F9" strokeWidth="6" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={`${dash.toFixed(2)} ${c2.toFixed(2)}`} strokeLinecap="round"
        transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray .9s cubic-bezier(.4,0,.2,1)' }} />
      <text x="44" y="40" textAnchor="middle" dominantBaseline="middle" fill={col} fontSize="22" fontFamily="'DM Mono',monospace" fontWeight="500">{score}</text>
      <text x="44" y="56" textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize="10" fontFamily="'DM Sans',sans-serif">/10</text>
    </svg>
  );
}

function Bar({ score, inv }: { score: number; inv: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score * 10), 220); return () => clearTimeout(t); }, [score]);
  const col = inv ? supc(score) : sc(score);
  return (
    <div style={{ height: 5, background: '#F1F5F9', borderRadius: 3 }}>
      <div style={{ height: '100%', background: col, borderRadius: 3, width: `${w}%`, transition: 'width .9s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
}

export default function Home() {
  const [kw, setKw] = useState('');
  const [lang, setLang] = useState('jp');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const analyze = async () => {
    if (!kw.trim() || loading) return;
    setLoading(true); setResult(null); setError(null); setSent(false); setStep(0);
    timer.current = setInterval(() => setStep(p => (p + 1) % 4), 1400);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw, lang }),
      });
      clearInterval(timer.current!);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || '分析に失敗しました'); }
      setResult(await res.json());
    } catch (e: unknown) {
      clearInterval(timer.current!);
      setError(e instanceof Error ? e.message : '分析中にエラーが発生しました。もう一度お試しください。');
    } finally { setLoading(false); }
  };

  const subscribe = async () => {
    if (!email.includes('@') || subscribing) return;
    setSubscribing(true);
    setSubError(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setSent(true);
    } catch (e: unknown) {
      setSubError(e instanceof Error ? e.message : '登録に失敗しました。もう一度お試しください。');
    } finally { setSubscribing(false); }
  };

  const vc = result ? (VERDICTS[result.verdict] || VERDICTS['差別化参入']) : null;
  const steps = lang === 'jp' ? STEPS_JP : STEPS_EN;
  const exs = lang === 'jp' ? EX_JP : EX_EN;
  const f = "'DM Sans',-apple-system,sans-serif";
  const m = "'DM Mono','Courier New',monospace";
  const card: React.CSSProperties = { background: 'white', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}
        input:focus{outline:none;border-color:#6366F1!important}
        .chip:hover{background:#EEF2FF!important;border-color:#A5B4FC!important;color:#3730A3!important}
        .abtn:not(:disabled):hover{background:#1E3A8A!important}
        .ep::placeholder{color:rgba(255,255,255,.28)}
        .rl:hover{color:#475569!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .u0{animation:up .35s ease forwards}
        .u1{animation:up .35s ease .08s forwards;opacity:0}
        .u2{animation:up .35s ease .16s forwards;opacity:0}
        .u3{animation:up .35s ease .24s forwards;opacity:0}
        .u4{animation:up .35s ease .32s forwards;opacity:0}
      `}</style>
      <div style={{ fontFamily: f, background: '#F8FAFC', minHeight: '100vh', padding: '20px 16px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 5 }}>FuuTen</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>YouTubeジャンル需給分析</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>AIが需要と競合を即分析。参入判断をデータで。</div>
            </div>
            <div style={{ display: 'flex', background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: 3, gap: 2 }}>
              {['jp', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '4px 12px', fontSize: 12, borderRadius: 6, fontFamily: f, border: 'none', cursor: 'pointer', transition: 'all .15s',
                  background: lang === l ? '#0F172A' : 'transparent', color: lang === l ? 'white' : '#9CA3AF', fontWeight: lang === l ? 500 : 400,
                }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ ...card, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>
              {lang === 'jp' ? '参入を検討しているYouTubeジャンル・キーワードを入力' : 'Enter the YouTube niche or keyword to analyze'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={kw} onChange={e => setKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()}
                placeholder={lang === 'jp' ? '例：英語学習、ペット、筋トレ…' : 'e.g. personal finance, fitness…'}
                disabled={loading}
                style={{ flex: 1, fontSize: 14, padding: '10px 13px', borderRadius: 9, border: '1px solid #E2E8F0', fontFamily: f, background: loading ? '#F8FAFC' : 'white', color: '#0F172A' }} />
              <button className="abtn" onClick={analyze} disabled={loading || !kw.trim()} style={{
                padding: '10px 20px', fontSize: 13, fontWeight: 500, borderRadius: 9, fontFamily: f, border: 'none',
                cursor: kw.trim() && !loading ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', transition: 'background .15s',
                background: kw.trim() && !loading ? '#1D4ED8' : '#F1F5F9', color: kw.trim() && !loading ? 'white' : '#94A3B8',
              }}>{loading ? '…' : lang === 'jp' ? '分析する' : 'Analyze'}</button>
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
              {exs.map(ex => (
                <span key={ex} className="chip" onClick={() => setKw(ex)} style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 5, cursor: 'pointer', userSelect: 'none', transition: 'all .1s',
                  background: kw === ex ? '#EEF2FF' : '#F8FAFC', color: kw === ex ? '#3730A3' : '#64748B', border: `1px solid ${kw === ex ? '#A5B4FC' : '#E2E8F0'}`,
                }}>{ex}</span>
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ ...card, padding: '30px 20px', textAlign: 'center' }}>
              <div style={{ width: 34, height: 34, margin: '0 auto 14px', border: '2.5px solid #E2E8F0', borderTopColor: '#1D4ED8', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>{steps[step]}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>「{kw}」</div>
            </div>
          )}

          {error && !loading && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#991B1B', marginBottom: 12 }}>{error}</div>
          )}

          {result && !loading && vc && (
            <div>
              <div className="u0" style={{ ...card, padding: 20, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>「{kw}」</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 7, background: vc.bg, border: `1.5px solid ${vc.border}`, marginBottom: 14 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: vc.dot }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: vc.color }}>{result.verdict}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 9, padding: '11px 13px', fontSize: 13, color: '#334155', lineHeight: 1.7 }}>{result.insight}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <Ring score={result.opportunity_score} />
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>機会スコア</div>
                  </div>
                </div>
              </div>

              <div className="u1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { lbl: lang === 'jp' ? '需要スコア' : 'Demand', s: result.demand_score, r: result.demand_reason, inv: false },
                  { lbl: lang === 'jp' ? '競合密度' : 'Competition', s: result.supply_score, r: result.supply_reason, inv: true },
                ].map(({ lbl, s, r, inv }) => (
                  <div key={lbl} style={{ ...card, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{lbl}</span>
                      <span style={{ fontSize: 26, fontWeight: 500, fontFamily: m, color: inv ? supc(s) : sc(s), lineHeight: 1 }}>{s}<span style={{ fontSize: 11, color: '#CBD5E1', fontFamily: f }}>/10</span></span>
                    </div>
                    <Bar score={s} inv={inv} />
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, lineHeight: 1.55 }}>{r}</div>
                  </div>
                ))}
              </div>

              <div className="u2" style={{ ...card, padding: '16px 18px', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 14 }}>
                  {lang === 'jp' ? 'この市場で勝てる3つの切り口' : '3 winning angles for this niche'}
                </div>
                {(result.winning_angles || []).map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#EFF6FF', color: '#1D4ED8', fontSize: 11, fontWeight: 500, fontFamily: m, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.7 }}>{a}</div>
                  </div>
                ))}
              </div>

              <div className="u3" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#78350F', marginBottom: 16 }}>
                <span style={{ flexShrink: 0, fontWeight: 500 }}>!</span>
                <span><strong style={{ fontWeight: 500 }}>{lang === 'jp' ? '注意点：' : 'Watch out: '}</strong>{result.risk}</span>
              </div>

              <div className="u4">
                {!sent ? (
                  <div style={{ background: '#0F172A', borderRadius: 14, padding: '20px 22px' }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'white', marginBottom: 5 }}>
                      {lang === 'jp' ? '完全な競合分析レポートを無料で受け取る' : 'Get the full competitor analysis report — free'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.42)', marginBottom: 16, lineHeight: 1.65 }}>
                      {lang === 'jp' ? '競合チャンネル詳細 · サムネ設計テンプレ · 台本フレームワーク · 優位性ロードマップ' : 'Competitor deep-dive · Thumbnail templates · Script framework · Competitive roadmap'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="ep" value={email} onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && subscribe()}
                        placeholder="your@email.com"
                        style={{ flex: 1, fontSize: 13, padding: '10px 13px', borderRadius: 9, fontFamily: f, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', color: 'white', outline: 'none' }} />
                      <button onClick={subscribe} disabled={subscribing || !email.includes('@')} style={{
                        padding: '10px 18px', fontSize: 13, fontWeight: 500, borderRadius: 9, fontFamily: f,
                        background: '#F59E0B', border: 'none', color: '#78350F',
                        cursor: email.includes('@') && !subscribing ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap', opacity: subscribing ? 0.7 : 1,
                      }}>
                        {subscribing ? '送信中…' : lang === 'jp' ? '無料で受け取る' : 'Get it free'}
                      </button>
                    </div>
                    {subError && <div style={{ fontSize: 11, color: '#FCA5A5', marginTop: 8 }}>{subError}</div>}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.18)', marginTop: 9 }}>
                      {lang === 'jp' ? 'スパムなし。いつでも解除できます。' : 'No spam. Unsubscribe any time.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 14, padding: '20px 22px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#064E3B', marginBottom: 6 }}>{lang === 'jp' ? '登録完了！' : "You're in!"}</div>
                    <div style={{ fontSize: 13, color: '#047857' }}>{lang === 'jp' ? '受信ボックスをご確認ください。完全レポートをお送りします。' : 'Check your inbox — your full report is on its way.'}</div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <span className="rl" onClick={() => { setResult(null); setKw(''); setEmail(''); setSent(false); }}
                  style={{ fontSize: 12, color: '#94A3B8', cursor: 'pointer', textDecoration: 'underline', transition: 'color .15s' }}>
                  {lang === 'jp' ? '別のキーワードを分析する' : 'Analyze another niche'}
                </span>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: '#CBD5E1' }}>
              風天 FuuTen · YouTubeジャンル需給分析ツール
            </div>
          )}
        </div>
      </div>
    </>
  );
}
