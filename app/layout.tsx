import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '風天 FuuTen — YouTubeジャンル需給分析',
  description: 'AIがYouTubeジャンルの需要と競合を即分析。参入判断をデータで。',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F8FAFC', fontFamily: "'DM Sans',-apple-system,sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
