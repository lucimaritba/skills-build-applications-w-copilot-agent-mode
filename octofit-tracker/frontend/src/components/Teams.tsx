import { useEffect, useState } from 'react';

type TeamItem = { name?: string; members?: Array<string | { toString: () => string }> };

export default function Teams() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('Unable to load teams');
        const data = await response.json();
        if (active) {
          setTeams(Array.isArray(data.teams) ? data.teams : []);
        }
      } catch {
        if (active) {
          setError('Unable to load teams');
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
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p role="alert">Unable to load teams.</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p>{teams.length === 0 ? <p>No teams.</p> : <ul>{teams.map((team, index) => <li key={`${team.name ?? 'team'}-${index}`}><strong>{team.name ?? 'Team'}</strong> {team.members && team.members.length > 0 ? `(${team.members.map((member) => String(member)).join(', ')})` : '(no members)'}</li>)}</ul>}</div></section>;
}
