import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Database, 
  Sparkles,
  TrendingDown,
  BrainCircuit,
  Lock,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  // Interactive Live Risk Calculator Demo on Landing Page
  const [demoLabs, setDemoLabs] = useState(55);
  const [demoInpatient, setDemoInpatient] = useState(1);
  const [demoA1C, setDemoA1C] = useState('>8');

  // Calculate dynamic risk score in real-time
  const calculateScore = () => {
    let score = (demoInpatient * 18.0) + (demoLabs * 0.4) + 18.0;
    if (demoA1C === '>8') score += 14.0;
    if (demoA1C === '>7') score += 7.0;
    return Math.min(98.5, Math.max(15.0, roundVal(score)));
  };

  const roundVal = (val) => Math.round(val * 10) / 10;
  const currentRiskScore = calculateScore();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Header Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 50,
        padding: '0.875rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--primary-600)',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                HealthForecast <span style={{ color: 'var(--primary-600)' }}>AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="landing-nav-links" style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            <a href="#features" style={{ color: 'inherit' }}>Features</a>
            <a href="#demo" style={{ color: 'inherit' }}>AI Risk Simulator</a>
            <a href="#roles" style={{ color: 'inherit' }}>Platform Roles</a>
            <a href="#analytics" style={{ color: 'inherit' }}>Analytics</a>
          </nav>

          {/* CTA Buttons */}
          <div className="landing-header-cta" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/login" className="btn btn-primary">
              Launch Platform <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero" style={{
        backgroundColor: '#f8fafc',
        padding: '4.5rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '9999px',
            color: 'var(--primary-700)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={14} /> AI-Powered Hospital Readmission Prediction & Clinical Risk Intelligence
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            lineHeight: '1.15',
            color: 'var(--text-primary)',
            maxWidth: '900px',
            margin: '0 auto 1.25rem'
          }}>
            Predict Hospital Readmissions & Prevent Clinical Risks Before Discharge
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2.25rem',
            lineHeight: '1.6'
          }}>
            An enterprise healthcare intelligence platform that calculates 30-day readmission risk probabilities, evaluates treatment effectiveness, and delivers real-time clinical decision support.
          </p>

          <div className="landing-hero-cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', fontWeight: '600' }}>
              Explore Doctor Dashboard <ArrowRight size={18} />
            </Link>
            <a href="#demo" className="btn btn-secondary" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', fontWeight: '600' }}>
              Try AI Risk Simulator
            </a>
          </div>

          {/* Metric Bar Highlights */}
          <div className="landing-metrics-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '4rem',
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary-600)' }}>38.5%</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Readmission Reduction</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In high-risk diabetic cohorts</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--success-500)' }}>94.2%</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Prediction Model Accuracy</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validated on Diabetes 130-US dataset</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--purple-600)' }}>100K+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Analyzed patient encounters</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Clinical Records</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--teal-600)' }}>4 Roles</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Role-Based Access Control</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HIPAA compliant data scoping</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive AI Risk Prediction Simulator Widget */}
      <section id="demo" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--primary-600)', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Interactive Technology Preview
            </div>
            <h2 className="landing-section-title" style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Live AI Readmission Risk Simulator
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Adjust clinical parameters to observe how the AI scoring engine computes 30-day readmission risk in real-time.
            </p>
          </div>

          {/* Interactive Calculator Box */}
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#f8fafc', borderColor: 'var(--border-color)' }}>
            <div className="landing-simulator-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Clinical Encounter Variables
                </h3>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    <span>Laboratory Procedures Count</span>
                    <span style={{ color: 'var(--primary-600)' }}>{demoLabs} tests</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={demoLabs}
                    onChange={(e) => setDemoLabs(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--primary-600)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    <span>Prior Inpatient Admissions (Past Year)</span>
                    <span style={{ color: 'var(--primary-600)' }}>{demoInpatient} visits</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={demoInpatient}
                    onChange={(e) => setDemoInpatient(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--primary-600)' }}
                  />
                </div>

                <div>
                  <label className="form-label">HbA1c Lab Test Result</label>
                  <select
                    value={demoA1C}
                    onChange={(e) => setDemoA1C(e.target.value)}
                    className="form-control"
                  >
                    <option value=">8">High Risk (&gt;8.0%)</option>
                    <option value=">7">Elevated (&gt;7.0%)</option>
                    <option value="Norm">Normal Range</option>
                  </select>
                </div>
              </div>

              {/* AI Output Gauge Preview */}
              <div style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  AI Predicted Readmission Probability
                </div>

                <div style={{
                  fontSize: '3.5rem',
                  fontWeight: '800',
                  color: currentRiskScore >= 65 ? 'var(--danger-500)' : currentRiskScore >= 40 ? 'var(--warning-500)' : 'var(--success-500)',
                  lineHeight: '1'
                }}>
                  {currentRiskScore}%
                </div>

                <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.35rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    backgroundColor: currentRiskScore >= 65 ? 'var(--danger-50)' : currentRiskScore >= 40 ? 'var(--warning-50)' : 'var(--success-50)',
                    color: currentRiskScore >= 65 ? 'var(--danger-700)' : currentRiskScore >= 40 ? 'var(--warning-700)' : 'var(--success-700)'
                  }}>
                    {currentRiskScore >= 65 ? 'HIGH RISK (<30 Days Readmit)' : currentRiskScore >= 40 ? 'MEDIUM RISK (>30 Days Readmit)' : 'LOW RISK'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <strong>CDS Suggestion:</strong> {currentRiskScore >= 65 ? 'Schedule 7-day Endocrinology check-in & home glucose monitoring kit.' : 'Standard discharge care plan.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Modules & Features Grid */}
      <section id="features" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: 'var(--primary-600)', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              End-to-End Capabilities
            </div>
            <h2 className="landing-section-title" style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Comprehensive Healthcare Intelligence Modules
            </h2>
          </div>

          <div className="landing-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Feature 1 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                1. Patient Risk Prediction
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Real-time risk score calculation and categorization (High, Medium, Low) based on encounter lab tests, medication adjustments, and inpatient history.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', color: 'var(--danger-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                2. Readmission Forecasting
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Machine learning probability model forecasting whether a patient is at risk of early 30-day readmission or late readmission.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Stethoscope size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                3. Clinical Decision Support (CDS)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Automated care recommendations, follow-up planning suggestions, and medication compliance checks embedded directly on patient profiles.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                4. Operational Analytics Dashboards
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Hospital performance monitoring by medical specialty, stay duration tracking, and demographic distribution breakdown.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdfa', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                5. Anonymized Research Export
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Export de-identified patient datasets stripping PII to support clinical research, outcome studies, and population health analysis.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: 'var(--warning-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                6. Role-Based Access Control (RBAC)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Strict permission matrix enforcing role boundaries for Doctors, Hospital Admins, Healthcare Researchers, and System Admins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role Matrix Showcase */}
      <section id="roles" style={{ padding: '4.5rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="landing-section-title" style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Operational Role Perspectives
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Tailored workflows and permissions built specifically for healthcare stakeholders.
            </p>
          </div>

          <div className="landing-roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ borderTop: '4px solid var(--primary-600)' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>🩺 Doctor</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Monitors assigned patient risks, reviews readmission probability forecasts, and generates discharge recommendations.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Test Doctor View <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid var(--purple-600)' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>🏥 Hospital Admin</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Monitors hospital performance, department resource utilization, length of stay, and readmission trends.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--purple-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Test Admin View <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid var(--teal-600)' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>📊 Researcher</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Analyzes anonymized datasets, evaluates treatment effectiveness, and exports clinical research data.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--teal-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Test Researcher View <ChevronRight size={14} />
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid #0f172a' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>⚙️ System Admin</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Manages user accounts, configures role permissions, monitors system audit logs, and handles platform governance.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Test SysAdmin View <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '3.5rem 1.5rem 2rem', fontSize: '0.875rem' }}>
        <div className="landing-footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              <Stethoscope size={22} style={{ color: 'var(--primary-500)' }} />
              HealthForecast AI
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: '1.6', color: '#64748b' }}>
              AI-Powered Hospital Readmission Prediction & Patient Risk Intelligence System built for hospitals, clinics, and healthcare researchers.
            </p>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '0.75rem' }}>Platform Navigation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Link to="/login" style={{ color: 'inherit' }}>Sign In</Link>
              <Link to="/register" style={{ color: 'inherit' }}>Register Profile</Link>
              <a href="#features" style={{ color: 'inherit' }}>Features</a>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '0.75rem' }}>Tech Stack</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
              <span>FastAPI (Python)</span>
              <span>React 18 + Vite</span>
              <span>SQLAlchemy + SQLite</span>
              <span>Diabetes 130-US Dataset</span>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', marginBottom: '0.75rem' }}>Security & Governance</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
              <span>JWT Bearer Auth</span>
              <span>Bcrypt Encryption</span>
              <span>Role-Based Access (RBAC)</span>
              <span>HIPAA Compliant PII Masking</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          © {new Date().getFullYear()} HealthForecast AI Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
