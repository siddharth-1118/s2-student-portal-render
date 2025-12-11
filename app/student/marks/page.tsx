'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StudentAnalyticsPage() {
  const { data: session } = useSession();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. CALCULATE ANALYTICS ---
  const totalSubjects = marks.length;
  const totalScore = marks.reduce((acc, curr) => acc + (curr.scored || 0), 0);
  const maxPossible = marks.reduce((acc, curr) => acc + (curr.maxMarks || 100), 0);
  
  // Calculate Average Percentage
  const averagePercentage = totalSubjects > 0 
    ? Math.round((totalScore / maxPossible) * 100) 
    : 0;

  // Find Highest Score
  const highestMark = marks.length > 0 
    ? Math.max(...marks.map(m => m.scored)) 
    : 0;

  // Count Passed Subjects (Assuming 50% is pass)
  const passedSubjects = marks.filter(m => (m.scored / (m.maxMarks || 100)) >= 0.5).length;

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch('/api/student/marks');
        if (res.ok) {
          const data = await res.json();
          setMarks(data);
        }
      } catch (error) {
        console.error('Failed to load marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '18px', color: '#64748b', fontWeight: 'bold' }}>⚡ Loading Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px 20px', 
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)', // Soft Purple/Blue Gradient
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* --- HEADER --- */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
             Welcome, {session?.user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Here is your academic performance report.</p>
        </div>

        {/* --- STATS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          <StatCard 
            title="Average Score" 
            value={`${averagePercentage}%`} 
            icon="📈" 
            color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" // Blue
            desc={averagePercentage >= 75 ? "Great job!" : "Keep improving"}
          />
          
          <StatCard 
            title="Highest Mark" 
            value={highestMark} 
            icon="🏆" 
            color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" // Orange
            desc="Your personal best"
          />
          
          <StatCard 
            title="Subjects Passed" 
            value={`${passedSubjects}/${totalSubjects}`} 
            icon="✅" 
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)" // Green
            desc="Subjects cleared"
          />

        </div>

        {/* --- DETAILED PERFORMANCE SECTION --- */}
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#334155', marginBottom: '20px' }}>
          Subject Performance
        </h2>

        {marks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
            <h3 style={{ color: '#64748b' }}>No marks uploaded yet.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {marks.map((entry) => (
              <SubjectAnalyticsCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (For Styling) ---

function StatCard({ title, value, icon, color, desc }: any) {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '20px', 
      padding: '25px', 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
      border: '1px solid #f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
          <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>{desc}</div>
      </div>
      {/* Background Decor */}
      <div style={{ 
        position: 'absolute', top: 0, right: 0, width: '100%', height: '6px', 
        background: color 
      }} />
    </div>
  );
}

function SubjectAnalyticsCard({ entry }: any) {
  const max = entry.maxMarks || 100;
  const percentage = Math.min((entry.scored / max) * 100, 100);
  
  // Color Logic: Green (>75), Blue (>50), Red (<50)
  const isExcellent = percentage >= 75;
  const isPass = percentage >= 50;
  
  const barColor = isExcellent ? '#10b981' : isPass ? '#3b82f6' : '#ef4444';
  const badgeColor = isPass ? '#dcfce7' : '#fee2e2';
  const badgeText = isPass ? '#166534' : '#991b1b';

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '20px', 
      padding: '24px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{entry.subject}</h3>
          <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
            {entry.examType || 'Internal'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span style={{ 
             background: badgeColor, color: badgeText, 
             padding: '4px 10px', borderRadius: '20px', 
             fontSize: '12px', fontWeight: 'bold' 
           }}>
             {isPass ? 'PASS' : 'FAIL'}
           </span>
        </div>
      </div>

      {/* Marks Display */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: '800', color: barColor }}>{entry.scored}</span>
        <span style={{ fontSize: '14px', color: '#94a3b8', paddingBottom: '6px', fontWeight: '500' }}>/ {max}</span>
      </div>

      {/* Progress Bar Container */}
      <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: barColor, 
          borderRadius: '10px',
          transition: 'width 1s ease-out'
        }} />
      </div>
      
      <div style={{ marginTop: '8px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
        {percentage.toFixed(0)}% Score
      </div>
    </div>
  );
}