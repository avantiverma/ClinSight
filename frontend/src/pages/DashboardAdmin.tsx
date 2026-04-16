import { Users, ShieldCheck } from 'lucide-react';

const DashboardAdmin = () => {
    return (
        <div className="max-w-7xl mx-auto w-full pb-12 pt-4">
            <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0F172A] flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">System Administration</h1>
                    <p className="mt-1 text-[#64748B] text-sm font-medium">Manage users and system configurations</p>
                </div>
            </div>

            {/* Stat Cards - Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#0EA5E9]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#F0F7FF] flex items-center justify-center shrink-0 group-hover:bg-[#0EA5E9] transition-colors">
                        <Users className="h-6 w-6 text-[#0EA5E9] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">0</div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total Doctors</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[16px] shadow-clinical-soft border border-[#CBD5E1] border-t-[4px] border-t-[#0F172A] overflow-hidden">
                <div className="px-8 py-6 border-b border-[#F1F5F9] bg-gray-50/50">
                    <h3 className="text-lg font-bold text-[#0F172A]">
                        Registered Doctors Directory
                    </h3>
                    <p className="text-sm text-[#64748B] mt-1">Manage platform access for medical professionals.</p>
                </div>

                <div className="p-16 text-center text-[#64748B]">
                    <div className="w-16 h-16 rounded-[16px] bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                        <Users className="h-8 w-8 text-[#94A3B8]" />
                    </div>
                    <h4 className="text-[#0F172A] font-semibold text-lg mb-2">No Doctors Registered Yet</h4>
                    <p className="text-sm max-w-sm mx-auto">When doctors join the platform, their details and access controls will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
