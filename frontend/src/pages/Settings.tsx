import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Shield, Bell } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">System Settings</h1>
                    <p className="text-[#64748B] text-sm font-medium">Manage your account and platform preferences</p>
                </div>
            </div>

            <div className="bg-white rounded-[20px] shadow-clinical-soft border border-[#E2E8F0] overflow-hidden mb-8 transition-all hover:shadow-md">
                <div className="p-6 border-b border-[#F1F5F9] bg-gray-50/50">
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                        <User className="h-5 w-5 text-[#94A3B8]" />
                        Professional Profile
                    </h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Full Name</label>
                            <p className="text-[#0F172A] font-bold text-lg">{user?.name || 'Dr. Avanti Verma'}</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Email Identity</label>
                            <p className="text-[#0F172A] font-semibold">{user?.username || 'avanti@clin-sight.ai'}</p>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Clinical Role</label>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F0F7FF] text-[#0EA5E9] capitalize border border-[#E0F2FE]">
                                {user?.role || 'Physician'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">Security Status</label>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#10B981] capitalize border border-[#D1FAE5]">
                                Verified Professional
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[20px] shadow-clinical-soft border border-[#E2E8F0] overflow-hidden transition-all hover:shadow-md">
                <div className="p-6 border-b border-[#F1F5F9] bg-gray-50/50">
                    <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#94A3B8]" />
                        Safety & Preferences
                    </h2>
                </div>
                <div className="p-8">
                    <div className="flex items-center justify-between p-5 rounded-[16px] border border-[#F1F5F9] bg-white hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-[#ECFDF5] rounded-[12px] text-[#10B981]">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#0F172A]">Real-time Clinical Alerts</h3>
                                <p className="text-sm text-[#64748B] font-medium mt-0.5">Receive immediate notifications for high-risk patient assessments.</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-[#10B981] rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
