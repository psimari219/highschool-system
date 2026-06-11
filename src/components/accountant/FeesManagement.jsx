import React, { useState, useMemo } from 'react';
import { Search, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Topbar from '../layout/Topbar';

export default function FeesManagement({ store }) {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const payments = store.feePayments || [];
  const feeStructure = store.feeStructure || [];
  const totalFeePerStudent = feeStructure.reduce((a, f) => a + f.amount, 0);

  const studentFeeData = useMemo(() => {
    return store.students.map(student => {
      const studentPayments = payments.filter(p => p.studentId === student.id);
      const paid = studentPayments.reduce((a, p) => a + p.amount, 0);
      const balance = totalFeePerStudent - paid;
      const status = balance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
      return { student, paid, balance: Math.max(0, balance), status, transactions: studentPayments.length };
    });
  }, [store.students, payments, totalFeePerStudent]);

  const filtered = studentFeeData.filter(({ student, status }) => {
    const q = search.toLowerCase();
    const matchSearch = !q || student.firstName.toLowerCase().includes(q) || student.lastName.toLowerCase().includes(q) || student.id.toLowerCase().includes(q);
    const matchGrade = !gradeFilter || student.grade === gradeFilter;
    const matchStatus = !statusFilter || status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  });

  const totalPaid = studentFeeData.reduce((a, s) => a + s.paid, 0);
  const totalOutstanding = studentFeeData.reduce((a, s) => a + s.balance, 0);

  return (
    <div>
      <Topbar title="Student Fees" subtitle="View and track student fee balances" school={store.school} />
      <div className="page-content animate-in">
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
          <div className="stat-card green">
            <div className="stat-icon green"><CheckCircle size={20} /></div>
            <div className="stat-value">{studentFeeData.filter(s=>s.status==='Paid').length}</div>
            <div className="stat-label">Fully Paid</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber"><Clock size={20} /></div>
            <div className="stat-value">{studentFeeData.filter(s=>s.status==='Partial').length}</div>
            <div className="stat-label">Partial</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon red"><AlertCircle size={20} /></div>
            <div className="stat-value">{studentFeeData.filter(s=>s.status==='Unpaid').length}</div>
            <div className="stat-label">Unpaid</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><DollarSign size={20} /></div>
            <div className="stat-value">${totalOutstanding.toLocaleString()}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        </div>

        {/* Collection progress bar */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontWeight: 700 }}>Total Collection Progress</span>
            <span style={{ color: 'var(--text3)' }}>${totalPaid.toLocaleString()} / ${(totalPaid + totalOutstanding).toLocaleString()}</span>
          </div>
          <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
            <div className="progress-fill progress-green" style={{
              width: `${totalPaid + totalOutstanding > 0 ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100) : 0}%`,
              borderRadius: 6
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            {totalPaid + totalOutstanding > 0 ? Math.round((totalPaid / (totalPaid + totalOutstanding)) * 100) : 0}% collected
          </div>
        </div>

        <div className="filters-row">
          <div className="search-bar" style={{ maxWidth: 300 }}>
            <Search size={14} color="var(--text3)" />
            <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
            <option value="">All Grades</option>
            {['9','10','11','12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Paid</option><option>Partial</option><option>Unpaid</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade</th>
                  <th>Total Fees</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Txns</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ student, paid, balance, status, transactions }, i) => {
                  const pct = totalFeePerStudent > 0 ? Math.round((paid / totalFeePerStudent) * 100) : 0;
                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={`avatar avatar-${['blue','green','purple','amber'][i%4]}`}>{student.firstName[0]}{student.lastName[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{student.firstName} {student.lastName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">Grade {student.grade}{student.stream}</span></td>
                      <td style={{ fontWeight: 600 }}>${totalFeePerStudent.toLocaleString()}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>${paid.toLocaleString()}</td>
                      <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                        {balance > 0 ? `-$${balance.toLocaleString()}` : '✓'}
                      </td>
                      <td style={{ minWidth: 100 }}>
                        <div className="progress-bar">
                          <div className={`progress-fill ${pct >= 100 ? 'progress-green' : pct > 50 ? 'progress-amber' : 'progress-red'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{pct}%</div>
                      </td>
                      <td>
                        <span className={`badge ${status==='Paid'?'badge-success':status==='Partial'?'badge-warning':'badge-danger'}`}>{status}</span>
                      </td>
                      <td style={{ color: 'var(--text3)', textAlign: 'center' }}>{transactions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
