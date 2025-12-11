"use client";
import React, { useState, useMemo, useEffect } from 'react';

// =========================================================
// ✅ YOUR CLASS LIST
// =========================================================
const MY_CLASS_LIST = [
  { id: 'RA2511026010603', name: 'YESHVANTH KRITHIK' },
  { id: 'RA2511026010869', name: 'VARNIKA JAIN' },
  { id: 'RA2511026010870', name: 'KONDA VEERAVENKATAGANESH' },
  { id: 'RA2511026010871', name: 'Y HARSHITHA' },
  { id: 'RA2511026010872', name: 'ESAKI KESAVAN V' },
  { id: 'RA2511026010874', name: 'KAVI PRIYA M' },
  { id: 'RA2511026010875', name: 'SAMRIDDHI SINGH' },
  { id: 'RA2511026010876', name: 'SATVIK SAHU' },
  { id: 'RA2511026010877', name: 'MOHAMMED UBAID UL NAFEY' },
  { id: 'RA2511026010878', name: 'ADITYA SHUBHANKAR' },
  { id: 'RA2511026010879', name: 'PARUL TEKADE' },
  { id: 'RA2511026010880', name: 'SIDDHARTHA MAJUMDER' },
  { id: 'RA2511026010881', name: 'KEVIN K SHIBU' },
  { id: 'RA2511026010882', name: 'BOBBALA MANJUNATH REDDY' },
  { id: 'RA2511026010883', name: 'AARYA JAIN' },
  { id: 'RA2511026010884', name: 'HARSHITHA GUNTUR' },
  { id: 'RA2511026010885', name: 'L NAGA ABHIESH REDDY' },
  { id: 'RA2511026010886', name: 'SHARMISTHA MOHAPATRA' },
  { id: 'RA2511026010887', name: 'VENKATA SAI TEJEESH CH' },
  { id: 'RA2511026010888', name: 'ARYA G A' },
  { id: 'RA2511026010889', name: 'MIHIR SINHA' },
  { id: 'RA2511026010890', name: 'PRANAV SINGH' },
  { id: 'RA2511026010891', name: 'AMRITHA H' },
  { id: 'RA2511026010892', name: 'A SAI SANZANA RREDDY' },
  { id: 'RA2511026010893', name: 'ARTH PARETA' },
  { id: 'RA2511026010894', name: 'ARPIT SINGH' },
  { id: 'RA2511026010895', name: 'SHARON NILUPHA J' },
  { id: 'RA2511026010896', name: 'ADUTIYA AGARWAL' },
  { id: 'RA2511026010897', name: 'TEG SINGH GILL' },
  { id: 'RA2511026010898', name: 'DHANUSH KUMAR S' },
  { id: 'RA2511026010899', name: 'ADIBOINA DIGVIJAY' },
  { id: 'RA2511026010900', name: 'DARSHIL JOSHI' },
  { id: 'RA2511026010901', name: 'RACHIT JHA' },
  { id: 'RA2511026010902', name: 'TAYDEN J' },
  { id: 'RA2511026010903', name: 'MANNI HARSHINI CHOWDARY' },
  { id: 'RA2511026010904', name: 'EISHIT JAIN' },
  { id: 'RA2511026010905', name: 'MALIK MOHMMAD AUSAIB' },
  { id: 'RA2511026010906', name: 'SAI SIDDHARTH VOOKA' },
  { id: 'RA2511026010907', name: 'SHUBHANG DARSHAN' },
  { id: 'RA2511026010908', name: 'SRI VAISHNAVIMEENA LA' },
  { id: 'RA2511026010909', name: 'ANURAG PRASAD' },
  { id: 'RA2511026010910', name: 'DONALD ABISHAI FERNANDO' },
  { id: 'RA2511026010911', name: 'HARIHARAN R' },
  { id: 'RA2511026010912', name: 'PANDIPRAJIN S' },
  { id: 'RA2511026010913', name: 'VISHNUVARDHAN RAMPRABU' },
  { id: 'RA2511026010914', name: 'S AHAMED THALHA' },
  { id: 'RA2511026010915', name: 'PARTH SINGH' },
  { id: 'RA2511026010916', name: 'THIRISHA M' },
  { id: 'RA2511026010917', name: 'MOHITHA SK' },
  { id: 'RA2511026010918', name: 'SHAGUN' },
  { id: 'RA2511026010919', name: 'AARON LOW' },
  { id: 'RA2511026010920', name: 'KRISH SHARMA' },
  { id: 'RA2511026010921', name: 'M SARVESH' },
  { id: 'RA2511026010922', name: 'KUNSH KAKKAR' },
  { id: 'RA2511026010923', name: 'PASALA GHANA CHARAN' },
  { id: 'RA2511026010924', name: 'DIKSHA GULATI' },
  { id: 'RA2511026010925', name: 'NOORUL ARFIN S' },
  { id: 'RA2511026010926', name: 'ARNAV SINGH' },
  { id: 'RA2511026010927', name: 'M MANUSREE' },
  { id: 'RA2511026010928', name: 'SHAURYA SINGLA' },
  { id: 'RA2511026010929', name: 'SUBHANKAR BISWAL' },
  { id: 'RA2511026010930', name: 'DHANUNJAY DAS' },
  { id: 'RA2511026010931', name: 'AANJNAY SAROHA' },
  { id: 'RA2511026010932', name: 'NAGULESH R' },
  { id: 'RA2511026010933', name: 'EPURI NITHIN' },
  { id: 'RA2511026010934', name: 'SAYED AYESHA' },
  { id: 'RA2511026010935', name: 'K ARAVIND' },
  { id: 'RA2511026010936', name: 'DEVA PRIYA DARSINI' },
  { id: 'RA2511026010937', name: 'KATEPALLI RAJESH' },
  { id: 'RA2511026010938', name: 'GOLI THANMAYE' },
  { id: 'RA2511026010939', name: 'YALLAPU VIHAS' },
  { id: 'RA2511026010940', name: 'AQIB SHAFEEQUE' },
];

export default function AdminNotifyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // --- States ---
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);
  
  // Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- Logic ---
  const toggleStudent = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const filteredStudents = useMemo(() => {
    return MY_CLASS_LIST.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.includes(searchTerm)
    );
  }, [searchTerm]);

  const selectAllFiltered = () => {
    const newIds = filteredStudents.map(s => s.id);
    setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
  };

  const handleSend = async () => {
    if (!title || !message) return alert("❌ Please enter a title and message.");
    if (target === 'specific' && selectedIds.length === 0) return alert("❌ Select at least one student.");

    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    alert(`✅ Sent to ${target === 'all' ? 'Everyone' : selectedIds.length + ' students'}!`);
    
    // Reset
    setTitle('');
    setMessage('');
    setSelectedIds([]);
    setLoading(false);
  };

  if (!mounted) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a365d', marginBottom: '5px' }}>
              📢 Admin Portal
            </h1>
            <p style={{ color: '#64748b' }}>Create and manage student announcements</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '50px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>Total Students: {MY_CLASS_LIST.length}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* LEFT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TARGET CARD */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }}>Audience</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div 
                  onClick={() => setTarget('all')}
                  style={{ 
                    cursor: 'pointer', padding: '15px', borderRadius: '10px', border: target === 'all' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                    backgroundColor: target === 'all' ? '#eff6ff' : 'white', color: target === 'all' ? '#1e40af' : '#64748b',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: target === 'all' ? '2px solid #2563eb' : '2px solid #cbd5e1', marginRight: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {target === 'all' && <div style={{ width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%' }} />}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>All 72 Students</span>
                </div>

                <div 
                  onClick={() => setTarget('specific')}
                  style={{ 
                    cursor: 'pointer', padding: '15px', borderRadius: '10px', border: target === 'specific' ? '2px solid #2563eb' : '2px solid #e2e8f0',
                    backgroundColor: target === 'specific' ? '#eff6ff' : 'white', color: target === 'specific' ? '#1e40af' : '#64748b',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: target === 'specific' ? '2px solid #2563eb' : '2px solid #cbd5e1', marginRight: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {target === 'specific' && <div style={{ width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%' }} />}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>Specific Students</span>
                </div>
              </div>

              {/* Specific Selection Button */}
              {target === 'specific' && (
                <div style={{ marginTop: '20px' }}>
                  <button 
                    onClick={() => setIsDropdownOpen(true)}
                    style={{ 
                      width: '100%', backgroundColor: '#0f172a', color: 'white', padding: '12px', borderRadius: '8px', 
                      fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                  >
                    Select Students {selectedIds.length > 0 && <span style={{ backgroundColor: '#3b82f6', fontSize: '12px', padding: '2px 8px', borderRadius: '20px' }}>{selectedIds.length}</span>}
                  </button>
                  
                  {selectedIds.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {selectedIds.slice(0, 5).map(id => (
                        <span key={id} style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {id.slice(-4)}
                          <button onClick={(e) => { e.stopPropagation(); toggleStudent(id); }} style={{ border: 'none', background: 'none', color: '#4338ca', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                        </span>
                      ))}
                      {selectedIds.length > 5 && <span style={{ fontSize: '11px', color: '#64748b' }}>+{selectedIds.length - 5} more</span>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PRIORITY CARD */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }}>Priority</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['normal', 'important', 'urgent'].map((p) => {
                  let bgColor = '#f1f5f9';
                  let textColor = '#64748b';
                  if (priority === p) {
                    if (p === 'urgent') { bgColor = '#dc2626'; textColor = 'white'; }
                    else if (p === 'important') { bgColor = '#f97316'; textColor = 'white'; }
                    else { bgColor = '#2563eb'; textColor = 'white'; }
                  }
                  return (
                    <button 
                      key={p}
                      onClick={() => setPriority(p as any)}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        backgroundColor: bgColor, color: textColor, fontWeight: 'bold', textTransform: 'capitalize'
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT EDITOR */}
          <div style={{ flex: 2 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Toolbar */}
              <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>FORMAT</span>
                <button style={{ border: 'none', background: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                <button style={{ border: 'none', background: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
                <button style={{ border: 'none', background: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
              </div>

              {/* Inputs */}
              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Subject Line..."
                  style={{ width: '100%', fontSize: '24px', fontWeight: 'bold', border: 'none', outline: 'none', color: '#1e293b' }}
                />
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your detailed announcement here..."
                  style={{ width: '100%', flex: 1, minHeight: '300px', fontSize: '16px', border: 'none', outline: 'none', color: '#475569', resize: 'none', fontFamily: 'sans-serif' }}
                />
              </div>

              {/* Footer */}
              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  style={{ 
                    backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px',
                    fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: loading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Announcement 🚀'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ================= MODAL POPUP ================= */}
        {isDropdownOpen && target === 'specific' && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' 
          }}>
            <div style={{ backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Select Students</h3>
                <button onClick={() => setIsDropdownOpen(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
              </div>

              <div style={{ padding: '15px', backgroundColor: 'white' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '10px', color: 'black' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={selectAllFiltered} style={{ flex: 1, padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Select All</button>
                  <button onClick={() => setSelectedIds([])} style={{ flex: 1, padding: '8px', backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Clear All</button>
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <div 
                        key={student.id} 
                        onClick={() => toggleStudent(student.id)}
                        style={{ 
                          padding: '12px', marginBottom: '5px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                          backgroundColor: isSelected ? '#eff6ff' : 'white', border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent'
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: isSelected ? 'none' : '2px solid #cbd5e1', backgroundColor: isSelected ? '#2563eb' : 'white', marginRight: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {isSelected && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', color: isSelected ? '#1e40af' : '#334155', fontSize: '14px' }}>{student.name}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{student.id}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No students found</div>
                )}
              </div>

              <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{selectedIds.length} Selected</span>
                <button onClick={() => setIsDropdownOpen(false)} style={{ backgroundColor: '#0f172a', color: 'white', padding: '10px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Done</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}