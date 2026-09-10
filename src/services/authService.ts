import { User, UserRole, AuthSession, SignupFormData, PlatformModule } from '../types';

// Storage keys
const STORAGE_KEY_USERS = 'healthforecast_users_db';
const STORAGE_KEY_SESSION = 'healthforecast_auth_session';
const STORAGE_KEY_RESET_TOKENS = 'healthforecast_reset_tokens';

// Canonical Demo Accounts matching PDF Specification
export const DEFAULT_DEMO_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'USR-DOC-001',
    name: 'Dr. Anita Sharma',
    email: 'anita.sharma@stjudehealth.org',
    role: 'DOCTOR',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    title: 'Senior Endocrinologist & Attending Physician',
    department: 'Endocrinology',
    hospital: 'St. Jude Metropolitan Health System',
    npiNumber: 'NPI-1849201948',
    status: 'active',
    lastLogin: 'Today, 07:45 AM',
    passwordHash: 'Doctor@2026!'
  },
  {
    id: 'USR-ADM-002',
    name: 'Dr. Katherine Vance',
    email: 'katherine.vance@stjudehealth.org',
    role: 'HOSPITAL_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    title: 'Chief Medical Officer & VP Clinical Quality',
    department: 'Hospital Administration',
    hospital: 'St. Jude Metropolitan Health System',
    npiNumber: 'NPI-1928374651',
    status: 'active',
    lastLogin: 'Today, 08:15 AM',
    passwordHash: 'Admin@2026!'
  },
  {
    id: 'USR-RES-003',
    name: 'Dr. Marcus Chen',
    email: 'marcus.chen@healthresearch.edu',
    role: 'HEALTHCARE_RESEARCHER',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=256',
    title: 'Senior Healthcare Data Scientist & Epidemiologist',
    department: 'Population Health & Clinical Research',
    hospital: 'Metropolitan Health Research Institute',
    status: 'active',
    lastLogin: 'Yesterday, 04:30 PM',
    passwordHash: 'Research@2026!'
  },
  {
    id: 'USR-SYS-004',
    name: 'Alex Mercer',
    email: 'alex.mercer@stjudehealth.org',
    role: 'SYSTEM_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    title: 'Lead Healthcare AI Systems Architect',
    department: 'Healthcare Informatics & AI Ops',
    hospital: 'St. Jude Metropolitan Health System',
    status: 'active',
    lastLogin: 'Today, 06:12 AM',
    passwordHash: 'SysAdmin@2026!'
  }
];

class AuthService {
  private getUsers(): (User & { passwordHash: string })[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // initialize defaults
    this.saveUsers(DEFAULT_DEMO_USERS);
    return DEFAULT_DEMO_USERS;
  }

  private saveUsers(users: (User & { passwordHash: string })[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      // storage unavailable
    }
  }

  // Generate simulated mock JWT token with role claims
  public generateMockJwt(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hospital: user.hospital || 'St. Jude Metropolitan',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days
      })
    );
    const signature = 'sig_hfai_' + Math.random().toString(36).substring(2, 15);
    return `${header}.${payload}.${signature}`;
  }

  // Create and persist session for user (used for login & role switches)
  public createSessionForUser(user: User, rememberMe = true): AuthSession {
    const token = this.generateMockJwt(user);
    const session: AuthSession = {
      user,
      token,
      expiresAt: Date.now() + (rememberMe ? 86400000 * 14 : 86400000)
    };
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } else {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
    return session;
  }

  // Get active session from localStorage or sessionStorage
  public getCurrentSession(): AuthSession | null {
    try {
      const storedLocal = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedLocal) {
        const session: AuthSession = JSON.parse(storedLocal);
        if (session.expiresAt > Date.now()) {
          return session;
        } else {
          localStorage.removeItem(STORAGE_KEY_SESSION);
        }
      }

      const storedSession = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (storedSession) {
        const session: AuthSession = JSON.parse(storedSession);
        if (session.expiresAt > Date.now()) {
          return session;
        } else {
          sessionStorage.removeItem(STORAGE_KEY_SESSION);
        }
      }
    } catch {
      // ignore parsing error
    }
    return null;
  }

  // Authenticate user with credentials
  public async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<AuthSession> {
    // Artificial small delay to simulate enterprise network auth
    await new Promise((resolve) => setTimeout(resolve, 450));

    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    const userMatch = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!userMatch) {
      throw new Error('Invalid email address. No registered user found with these credentials.');
    }

    if (userMatch.passwordHash !== password) {
      throw new Error('Incorrect password. Please verify your credentials or use password reset.');
    }

    if (userMatch.status.toLowerCase() === 'inactive') {
      throw new Error('Account deactivated. Contact St. Jude IT Administration for reactivation.');
    }

    // Update last login
    userMatch.lastLogin = 'Just now';
    this.saveUsers(users);

    const { passwordHash: _, ...safeUser } = userMatch;
    const token = this.generateMockJwt(safeUser);
    const session: AuthSession = {
      user: safeUser,
      token,
      expiresAt: Date.now() + (rememberMe ? 86400000 * 14 : 86400000) // 14 days or 24 hours
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } else {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }

    return session;
  }

  // Quick Demo Login helper
  public async demoLogin(role: UserRole, rememberMe = false): Promise<AuthSession> {
    const demoCreds = this.getDemoCredentials(role);
    return this.login(demoCreds.email, demoCreds.password, rememberMe);
  }

  // Register a new user
  public async signup(data: SignupFormData): Promise<{ user: User }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = data.email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match. Please re-enter your password.');
    }

    if (!data.agreeToTerms) {
      throw new Error('You must accept the HIPAA Compliance and Platform Terms to register.');
    }

    // Role specific titles and avatars
    const roleMeta: Record<UserRole, { title: string; dept: string; avatar: string }> = {
      DOCTOR: {
        title: 'Attending Physician',
        dept: 'Clinical Inpatient Care',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'
      },
      HOSPITAL_ADMIN: {
        title: 'Healthcare Operations Director',
        dept: 'Clinical Quality & Administration',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256'
      },
      HEALTHCARE_RESEARCHER: {
        title: 'Clinical Data Scientist',
        dept: 'Biostatistics & Research',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
      },
      SYSTEM_ADMIN: {
        title: 'Healthcare IT Systems Engineer',
        dept: 'Healthcare Informatics & Security',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
      }
    };

    const meta = roleMeta[data.role];
    const newId = `USR-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User & { passwordHash: string } = {
      id: newId,
      name: data.fullName.trim(),
      email: normalizedEmail,
      role: data.role,
      avatar: meta.avatar,
      title: meta.title,
      department: meta.dept,
      hospital: data.hospital.trim() || 'St. Jude Metropolitan Health System',
      status: 'active',
      lastLogin: 'Never',
      isDemoAccount: true,
      passwordHash: data.password
    };

    users.push(newUser);
    this.saveUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser };
  }

  // Request password reset
  public async requestPasswordReset(email: string): Promise<{ resetToken: string; expiresAt: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const userMatch = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!userMatch) {
      throw new Error('No registered account found with that email address.');
    }

    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Store token
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_RESET_TOKENS) || '{}');
      existing[normalizedEmail] = { token: resetToken, expires: Date.now() + 3600000 };
      localStorage.setItem(STORAGE_KEY_RESET_TOKENS, JSON.stringify(existing));
    } catch {
      // fallback
    }

    return { resetToken, expiresAt };
  }

  // Reset password
  public async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    users[userIndex].passwordHash = newPassword;
    this.saveUsers(users);
  }

  // Clear session
  public logout(): void {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  }

  // Get demo credentials for testing
  public getDemoCredentials(role: UserRole): { email: string; password: string; name: string; title: string } {
    switch (role) {
      case 'DOCTOR':
        return {
          email: 'anita.sharma@stjudehealth.org',
          password: 'Doctor@2026!',
          name: 'Dr. Anita Sharma',
          title: 'Senior Endocrinologist & Attending Physician'
        };
      case 'HOSPITAL_ADMIN':
        return {
          email: 'katherine.vance@stjudehealth.org',
          password: 'Admin@2026!',
          name: 'Dr. Katherine Vance',
          title: 'Chief Medical Officer & VP Clinical Quality'
        };
      case 'HEALTHCARE_RESEARCHER':
        return {
          email: 'marcus.chen@healthresearch.edu',
          password: 'Research@2026!',
          name: 'Dr. Marcus Chen',
          title: 'Senior Healthcare Data Scientist & Epidemiologist'
        };
      case 'SYSTEM_ADMIN':
        return {
          email: 'alex.mercer@stjudehealth.org',
          password: 'SysAdmin@2026!',
          name: 'Alex Mercer',
          title: 'Lead Healthcare AI Systems Architect'
        };
    }
  }

  // Get default landing dashboard based on role
  public getDefaultDashboardForRole(role: UserRole): string {
    switch (role) {
      case 'DOCTOR':
        return 'doctor-dashboard';
      case 'HOSPITAL_ADMIN':
        return 'hospital-dashboard';
      case 'HEALTHCARE_RESEARCHER':
        return 'researcher-dashboard';
      case 'SYSTEM_ADMIN':
        return 'admin-dashboard';
    }
  }

  // Check module permission based on Page 6 of Specification Matrix
  public canAccessModule(role: UserRole, moduleId: string): boolean {
    // All roles can access settings and notifications
    if (moduleId === 'settings' || moduleId === 'notifications') {
      return true;
    }

    // Role specific dashboards
    if (moduleId === 'doctor-dashboard') return role === 'DOCTOR' || role === 'SYSTEM_ADMIN';
    if (moduleId === 'hospital-dashboard') return role === 'HOSPITAL_ADMIN' || role === 'SYSTEM_ADMIN';
    if (moduleId === 'researcher-dashboard') return role === 'HEALTHCARE_RESEARCHER' || role === 'SYSTEM_ADMIN';
    if (moduleId === 'admin-dashboard') return role === 'SYSTEM_ADMIN';
    if (moduleId === 'dashboard') return true;

    // Clinical modules
    switch (moduleId) {
      case 'patients':
        // All can view patients (Doctor: assigned only, Admin: view only, Researcher: anonymized, SysAdmin: full)
        return true;

      case 'risk-predictions':
        // Doctor: Yes, Admin: Yes, Researcher: Aggregated, SysAdmin: Yes
        return true;

      case 'readmission-forecasts':
        // Doctor: Yes, Admin: Yes, Researcher: Aggregated, SysAdmin: Yes
        return true;

      case 'treatment-effectiveness':
        // Doctor: Yes, Admin: Yes, Researcher: Yes, SysAdmin: Yes
        return true;

      case 'clinical-decision-support':
        // Doctor: Yes (Order/Approve), Hospital Admin: No, Researcher: No, SysAdmin: Yes
        return role === 'DOCTOR' || role === 'SYSTEM_ADMIN';

      case 'healthcare-analytics':
        // Doctor: Limited (department only), Admin: Full, Researcher: Aggregated, SysAdmin: Full
        return true;

      case 'reports':
        // All can access reports, but specific report templates are gated
        return true;

      // SysAdmin only modules
      case 'admin-users':
      case 'admin-roles':
      case 'admin-datasets':
      case 'admin-models':
      case 'admin-audit':
        return role === 'SYSTEM_ADMIN';

      default:
        return true;
    }
  }
}

export const authService = new AuthService();
