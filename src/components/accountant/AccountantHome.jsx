import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Users, AlertCircle, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#06d6a0', '#3b82f6', '#f59e0b', '#ef4444', '#a78bfa'];

export default function AccountantHome({ store }) {
  const navigate = useNavigate();
  const base = '/accountant';

  const payments = store.feePayments || [];
  const feeStructure = store.feeStructure || [];
  const students = store.students;

  const totalCollected = payments.reduce((a, p) => a + p.amount, 0);

  // Per-student balance
  const studentBalances = useMemo(() => {
    return students.map(student => {
      const paid = payments.filter(p => p.studentId === student.id).reduce((a, p) => a + p.amount, 0);
      const owed = feeStructure.reduce((a, f) => a + f.amount, 0);
      return { student, paid, owed, balance: owed - paid };
    });
  }, [students, payments, feeStructure]);

  const totalOwed = studentBalances.reduce((a, s) => a + s.owed, 0);
  const totalOutstanding = studentBalances.reduce((a, s) => a + Math.max(0, s.balance), 0);
  const fullyPaid = studentBalances.filter(s => s.balance <= 0).length;
  const hasArrears = studentBalances.filter(s => s.balance > 0).length;

  // Monthly collection data
  const monthlyData = useMemo(() => {
    const months = {};
    payments.forEach(p => {
      const m = p.date?.substring(0, 7) || 'Unknown';
      months[m] = (months[m] || 0) + p.amount;
    });
    return Object.entries(months).sort().map(([month, amount]) => ({
      month: month.substring(5), amount
    }));
  }, [payments]);

  // Collection by method
  const byMethod = useMemo(() => {
    const m = {};
    payments.forEach(p => { m[p.method] = (m[p.method] || 0) + p.amount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [payments]);

  // Staff payroll total
  const teacherPayroll = (store.teachers || []).reduce((a, t) => a + (t.salary || 0), 0);
  const staffPayroll = (store.staff || []).reduce((a, s) => a + (s.salary || 0), 0);
  const totalPayroll = teacherPayroll + staffPayroll;

  return (
    <div className="page-content animate-in">
      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="stat-card green" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/payments`)}>
          <div className="stat-icon green"><DollarSign size={20} /></div>
          <div className="stat-value">${totalCollected.toLocaleString()}</div>
          <div className="stat-label">Total Collected</div>
          <div className="stat-sub">{payments.length} transactions</div>
        </div>
        <div className="stat-card red" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/fees`)}>
          <div className="stat-icon red"><AlertCircle size={20} /></div>
          <div className="stat-value">${totalOutstanding.toLocaleString()}</div>
          <div className="stat-label">Outstanding</div>
          <div className="stat-sub">{hasArrears} students with arrears</div>
        </div>
        <div className="stat-card blue" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/fees`)}>
          <div className="stat-icon blue"><CheckCircle size={20} /></div>
          <div className="stat-value">{fullyPaid}</div>
          <div className="stat-label">Fully Paid</div>
          <div className="stat-sub">out of {students.length} students</div>
        </div>
        <div className="stat-card purple" style={{ cursor:'pointer' }} onClick={() => navigate(`${base}/payroll`)}>
          <div className="stat-icon purple"><Users size={20} /></div>
          <div className="stat-value">${totalPayroll.toLocaleString()}</div>
          <div className="stat-label">Monthly Payroll</div>
          <div className="stat-sub">{(store.teachers||[]).length + (store.staff||[]).length} staff</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Collections</div>
            <span className="badge badge-success">{store.school.currentYear}</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
              <XAxis dataKey="month" stroke="#5a7a99" tick={{ fontSize: 11 }} />
              <YAxis stroke="#5a7a99" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8, fontSize: 12 }}
                formatter={v => [`$${v.toLocaleString()}`, 'Collected']}
              />
              <Bar dataKey="amount" fill="#06d6a0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">By Method</div></div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byMethod} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {byMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #2d3f55', borderRadius: 8, fontSize: 12 }}
                formatter={v => [`$${v.toLocaleString()}`]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {byMethod.map((m, i) => (
              <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                  <span style={{ color: 'var(--text2)' }}>{m.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>${m.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee collection progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Collection Progress</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/fees`)}>View All <ChevronRight size={12} /></button>
          </div>
          {totalOwed > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: 'var(--text3)' }}>Overall collection rate</span>
                <span style={{ fontWeight: 700 }}>{Math.round((totalCollected / totalOwed) * 100)}%</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill progress-green" style={{ width: `${Math.min(100, (totalCollected / totalOwed) * 100)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4, color: 'var(--text3)' }}>
                <span>Collected: ${totalCollected.toLocaleString()}</span>
                <span>Expected: ${totalOwed.toLocaleString()}</span>
              </div>
            </div>
          )}
          {/* Top debtors */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Highest Balances Due</div>
          {studentBalances
            .filter(s => s.balance > 0)
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 5)
            .map(({ student, balance, paid, owed }) => (
              <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-red" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{student.firstName} {student.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Grade {student.grade}{student.stream} · Paid ${paid}</div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 13 }}>-${balance}</span>
              </div>
            ))
          }
          {studentBalances.filter(s => s.balance > 0).length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--success)', fontSize: 13 }}>
              ✓ All students are up to date!
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${base}/payments`)}>View All <ChevronRight size={12} /></button>
          </div>
          {payments.slice(-6).reverse().map(p => {
            const student = students.find(s => s.id === p.studentId);
            const fee = feeStructure.find(f => f.id === p.feeId);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ background: 'rgba(6,214,160,0.1)', borderRadius: 8, padding: 8 }}>
                  <DollarSign size={14} color="var(--accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{student?.firstName} {student?.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fee?.name || 'Fee'} · {p.method}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 13 }}>+${p.amount}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.date}</div>
                </div>
              </div>
            );
          })}
          {payments.length === 0 && <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20, fontSize: 13 }}>No transactions yet</div>}
        </div>
      </div>
    </div>
  );
}
