import { useEffect, useState } from 'react';

type WorkoutSuggestion = { title?: string; focus?: string; reason?: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const userEmail = 'mona@example.com';
        const response = await fetch(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`);
        if (!response.ok) throw new Error('Unable to load workout suggestions');
        const data = await response.json();
        if (active) {
          setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        }
      } catch {
        if (active) {
          setError('Unable to load workout suggestions');
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
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p role="alert">Unable to load workout suggestions.</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p>{suggestions.length === 0 ? <p>No workout suggestions.</p> : <ul>{suggestions.map((suggestion, index) => <li key={`${suggestion.title ?? 'workout'}-${index}`}><strong>{suggestion.title ?? 'Workout'}</strong>{suggestion.focus ? ` — ${suggestion.focus}` : ''}{suggestion.reason ? <span> — {suggestion.reason}</span> : null}</li>)}</ul>}</div></section>;
}
