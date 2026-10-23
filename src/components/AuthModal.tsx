import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrganizerType, UserRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  Hash,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'admin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'admin' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('student');
  const [organizerType, setOrganizerType] = useState<OrganizerType>('Student Club / Society');
  const [department, setDepartment] = useState('Computer Engineering');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialMode === 'admin' ? 'admin@apcoer.edu.in' : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [prn, setPrn] = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingOrganizerDetails, setPendingOrganizerDetails] = useState<{
    name: string;
    email: string;
    department: string;
    organizerType: string;
  } | null>(null);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialMode === 'admin') {
        setEmail('admin@apcoer.edu.in');
      }
      setPassword('');
      setError(null);
      setPendingOrganizerDetails(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'signin' | 'admin' | 'register') => {
    setMode(newMode);
    setError(null);
    setPassword('');
    setPendingOrganizerDetails(null);
    if (newMode === 'admin') {
      setEmail('admin@apcoer.edu.in');
    } else if (email === 'admin@apcoer.edu.in') {
      setEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await register({
          name,
          email,
          password,
          role,
          organizerType: role === 'organizer' ? organizerType : undefined,
          department,
          prn: role === 'student' ? prn : undefined,
          designation: role !== 'student' ? designation : undefined,
        });

        if (role === 'organizer' || result?.pendingApproval) {
          setPendingOrganizerDetails({
            name,
            email,
            department,
            organizerType,
          });
          return;
        }

        // Student registered with instant access
        onClose();
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              {mode === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              ) : null}
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'register'
                  ? 'Create CampusConnect Account'
                  : mode === 'admin'
                  ? 'APCOER Institutional Admin Portal'
                  : 'Sign in to CampusConnect'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'register'
                ? 'Student & Faculty Organizer Registration'
                : mode === 'admin'
                ? 'Sign in with administrative credentials'
                : 'Enter your institutional email & password'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        {!pendingOrganizerDetails && (
          <div className="flex items-center border-b border-slate-200 bg-slate-100/60 px-4 pt-2">
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                mode === 'signin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('admin')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                mode === 'admin'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* If Organizer Registration Pending Modal */}
        {pendingOrganizerDetails ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-full shrink-0">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Organizer Registration Awaiting Approval
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Submitted for verification by Dr. Sunil Thakare (Principal / Admin)
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Applicant Details
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-800">{pendingOrganizerDetails.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800">{pendingOrganizerDetails.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{pendingOrganizerDetails.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entity:</span>
                <span className="font-semibold text-slate-800">{pendingOrganizerDetails.organizerType}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/70 p-3.5 rounded-lg border border-blue-100">
              <div className="font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" /> APCOER Institutional Policy
              </div>
              Per college protocol, event organizers must be verified by the Principal's office before obtaining access to create events and mark attendance. You will be able to log in once your account is verified.
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Understood / Close
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  error.toLowerCase().includes('pending approval') || error.toLowerCase().includes('awaiting approval')
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {error.toLowerCase().includes('pending approval') ? (
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {error.toLowerCase().includes('pending approval')
                      ? 'Account Pending Administrative Approval'
                      : 'Authentication Error'}
                  </div>
                  <div className="mt-0.5 leading-relaxed">{error}</div>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                {/* Role Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        role === 'student'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        role === 'organizer'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Event Organizer
                    </button>
                  </div>
                </div>

                {/* Instant Access vs Approval Notice Banner */}
                {role === 'student' ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Instant Access:</strong> Student accounts do not require admin approval. You can register and log in immediately.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Admin Approval Required:</strong> Organizer accounts require verification by Dr. Sunil Thakare (Principal / Admin) before activation.
                    </span>
                  </div>
                )}

                {/* Organizer Type */}
                {role === 'organizer' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organizer Entity Type
                    </label>
                    <select
                      value={organizerType}
                      onChange={(e) => setOrganizerType(e.target.value as OrganizerType)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Student Club / Society">Student Club / Society</option>
                      <option value="Department">Department</option>
                      <option value="Faculty / Committee">Faculty / Committee</option>
                      <option value="Placement Cell">Placement Cell</option>
                    </select>
                  </div>
                )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Entity Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Snehal Patil' : 'e.g. Prof. Rajesh More'}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Branch
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electronics & Telecommunication">
                      Electronics & Telecommunication
                    </option>
                    <option value="Artificial Intelligence & Data Science">
                      Artificial Intelligence & Data Science
                    </option>
                    <option value="First Year Engineering">First Year Engineering</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              {/* PRN for student */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Registration Number (PRN)
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={prn}
                      onChange={(e) => setPrn(e.target.value)}
                      placeholder="e.g. 72120045B"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Designation for organizer */}
              {role === 'organizer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Assistant Professor / Club Secretary"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {mode === 'admin' ? 'Institutional Administrator Email' : 'Institutional Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'admin' ? 'admin@apcoer.edu.in' : 'name@apcoer.edu.in'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Password - strictly masked, no password text shown anywhere */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 ${
              mode === 'admin'
                ? 'bg-indigo-700 hover:bg-indigo-800'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading
              ? 'Verifying...'
              : mode === 'register'
              ? 'Complete Registration'
              : mode === 'admin'
              ? 'Sign In as Administrator'
              : 'Sign In'}
          </button>
        </form>
        )}

        {/* Footer info */}
        {!pendingOrganizerDetails && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              {mode === 'register' ? 'Already registered?' : 'Need an account?'}
            </span>
            <button
              type="button"
              onClick={() => handleModeSwitch(mode === 'register' ? 'signin' : 'register')}
              className="text-blue-600 font-semibold hover:underline"
            >
              {mode === 'register' ? 'Sign In here' : 'Create Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
