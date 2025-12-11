"use client";
import React, { useState } from 'react';

export default function CalculatorPage() {
  const [subjects, setSubjects] = useState([{ name: '', credit: '', grade: '10' }]);
  const [result, setResult] = useState<string | null>(null);

  const addSubject = () => {
    setSubjects([...subjects, { name: '', credit: '', grade: '10' }]);
  };

  const calculateSGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    
    subjects.forEach(sub => {
      const credit = parseFloat(sub.credit);
      const grade = parseFloat(sub.grade);
      if (!isNaN(credit) && !isNaN(grade)) {
        totalCredits += credit;
        totalPoints += (credit * grade);
      }
    });

    if (totalCredits === 0) {
      setResult("Please enter valid credits.");
    } else {
      setResult(`Your SGPA/CGPA is: ${(totalPoints / totalCredits).toFixed(2)}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎓 CGPA & SGPA Calculator</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-black">
        <div className="mb-4 grid grid-cols-12 gap-2 font-semibold text-gray-600 text-sm">
            <div className="col-span-5">Subject</div>
            <div className="col-span-3">Credit</div>
            <div className="col-span-4">Grade</div>
        </div>

        {subjects.map((sub, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-3">
            <input 
              placeholder="Subject Name" 
              className="col-span-5 border p-2 rounded"
              onChange={(e) => {
                const newSubs = [...subjects];
                newSubs[index].name = e.target.value;
                setSubjects(newSubs);
              }}
            />
            <input 
              type="number" 
              placeholder="Cr" 
              className="col-span-3 border p-2 rounded"
              onChange={(e) => {
                const newSubs = [...subjects];
                newSubs[index].credit = e.target.value;
                setSubjects(newSubs);
              }}
            />
            <select 
              className="col-span-4 border p-2 rounded"
              onChange={(e) => {
                const newSubs = [...subjects];
                newSubs[index].grade = e.target.value;
                setSubjects(newSubs);
              }}
            >
              <option value="10">O (10)</option>
              <option value="9">A+ (9)</option>
              <option value="8">A (8)</option>
              <option value="7">B+ (7)</option>
              <option value="6">B (6)</option>
              <option value="0">Fail (0)</option>
            </select>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button onClick={addSubject} className="bg-gray-100 px-4 py-2 rounded text-black hover:bg-gray-200 border">+ Add Subject</button>
          <button onClick={calculateSGPA} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">Calculate Result</button>
        </div>

        {result && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="text-xl font-bold text-blue-800">{result}</p>
            </div>
        )}
      </div>
    </div>
  );
}