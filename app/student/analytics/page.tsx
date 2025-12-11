'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CALCULATIONS ---
  const totalSubjects = marks.length;
  const totalScore = marks.reduce((acc, m) => acc + (m.scored || 0), 0);
  const maxPossible = marks.reduce((acc, m) => acc + (m.maxMarks || 100), 0);
  const average = totalSubjects > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;
  
  // Highest Score
  const highest = marks.length > 0 ? Math.max(...marks.map(m => m.scored)) : 0;
  const highestSubject = marks.find(m => m.scored === highest)?.subject || '-';

  // Pass vs Fail (Assuming 50% cutoff)
  const passed = marks.filter(m => (m.scored / (m.maxMarks || 100)) >= 0.5).length;
  const failed = totalSubjects - passed;

  useEffect(() => {
    fetch('/api/student/marks')
      .then(res => res.json())
      .then(data => {
        setMarks(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ fontWeight: 'bold', color: '#64748b' }}>Loading Analytics...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>📊 Performance Analytics</h1>
            <p style={{ color: '#64748b' }}>Insights for {session?.user?.name}</p>
          </div>
          <button 
            onClick={() => router.back()}
            style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
          >
            ← Back
          </button>
        </div>

        {/* TOP STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <StatBox title="Average Score" value={`${average}%`} color="#3b82f6" icon="📉" />
          <StatBox title="Highest Mark" value={highest} sub={highestSubject} color="#10b981" icon="🏆" />
          <StatBox title="Subjects Cleared" value={`${passed} / ${totalSubjects}`} color="#8b5cf6" icon="✅" />
          <StatBox title="Pending/Fail" value={failed} color="#ef4444" icon="⚠️" />
        </div>

        {/* PERFORMANCE BARS */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '25px', color: '#334155' }}>Subject Mastery</h2>
          
          {marks.length === 0 ? <p style={{color: '#94a3b8', fontStyle: 'italic'}}>No data available to analyze.</p> : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {marks.map((m) => (
              <ProgressBar key={m.id} subject={m.subject} scored={m.scored} max={m.maxMarks || 100} />
            ))}
          </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '20px', padding: '30px', color: 'white' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>💡 AI Suggestion</h2>
          <p style={{ opacity: 0.9, lineHeight: '1.6' }}>
            {average >= 80 ? "You are performing exceptionally well! Keep maintaining this consistency across all subjects." : 
             average >= 60 ? "Good job! You are on the right track. Focus a bit more on your weaker subjects to boost your average." : 
             "It looks like you are struggling in a few areas. Don't hesitate to ask your teachers for extra help. You can do this!"}
          </p>
        </div>

      </div>
    </div>
  );
}

// --- COMPONENTS ---

function StatBox({ title, value, sub, color, icon }: any) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', borderLeft: `5px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ subject, scored, max }: any) {
  const percentage = Math.min((scored / max) * 100, 100);
  let color = '#3b82f6'; // Blue
  if (percentage >= 80) color = '#10b981'; // Green
  if (percentage < 50) color = '#ef4444'; // Red

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontWeight: '600', color: '#475569' }}>{subject}</span>
        <span style={{ fontWeight: '700', color: color }}>{scored}/{max} ({percentage.toFixed(0)}%)</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '5px', transition: 'width 1s' }}></div>
      </div>
    </div>
  );
}