import { useEffect, useState } from 'react';

type ActivityItem = { type?: string; minutes?: number; points?: number };

export default function Activities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) throw new Error('Unable to load activities');
        const data = await response.json();
        if (active) {
          setActivities(Array.isArray(data.activities) ? data.activities : []);
        }
      } catch {
        if (active) {
          setError('Unable to load activities');
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
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p role="alert">Unable to load activities.</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p>{activities.length === 0 ? <p>No activities.</p> : <ul>{activities.map((activity, index) => <li key={`${activity.type ?? 'activity'}-${index}`}>{activity.type ?? 'Activity'} — {activity.minutes ?? 0} minutes, {activity.points ?? 0} points</li>)}</ul>}</div></section>;
}
