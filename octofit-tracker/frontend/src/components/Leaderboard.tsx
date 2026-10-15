import { useEffect, useState } from 'react';

type LeaderboardItem = { teamName?: string; totalPoints?: number; rank?: number };

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) throw new Error('Unable to load leaderboard');
        const data = await response.json();
        if (active) {
          setEntries(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        }
      } catch {
        if (active) {
          setError('Unable to load leaderboard');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p><p role="alert">Unable to load leaderboard.</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Leaderboard</h2><p>Compare team point totals.</p>{entries.length === 0 ? <p>No leaderboard.</p> : <ol>{entries.map((entry, index) => <li key={`${entry.teamName ?? 'team'}-${index}`}>{entry.teamName ?? 'Team'} — {entry.totalPoints ?? 0} points</li>)}</ol>}</div></section>;
}
