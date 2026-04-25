import { useState, useEffect } from 'react';
import { Users, ShieldCheck, ChevronDown, ChevronUp, User, Calendar, Database } from 'lucide-react';
import { getAdminDashboardData } from '../services/api';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    admission_date: string;
}

interface Doctor {
    id: string;
    name: string;
    username: string;
    role: string;
    patient_count: number;
    patients: Patient[];
}

const DashboardAdmin = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const response = await getAdminDashboardData();
                setDoctors(response.data.doctors);
                setTotalDoctors(response.data.total_doctors);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching admin data:", err);
                setError(err.response?.data?.detail || "Failed to load administration data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const toggleExpand = (doctorId: string) => {
        if (expandedDoctor === doctorId) {
            setExpandedDoctor(null);
        } else {
            setExpandedDoctor(doctorId);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9]"></div>
                <p className="mt-4 text-[#64748B] font-medium">Loading administrative overview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-12 p-8 bg-red-50 rounded-[16px] border border-red-100 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-900 mb-2">Access Error</h2>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full pb-12 pt-4">
            <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0F172A] flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">System Administration</h1>
                    <p className="mt-1 text-[#64748B] text-sm font-medium">Monitoring platform usage and medical professionals</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#0EA5E9]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#F0F7FF] flex items-center justify-center shrink-0 group-hover:bg-[#0EA5E9] transition-colors">
                        <Users className="h-6 w-6 text-[#0EA5E9] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">{totalDoctors}</div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total Registered Doctors</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#10B981]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center shrink-0 group-hover:bg-[#10B981] transition-colors">
                        <Database className="h-6 w-6 text-[#10B981] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">
                            {doctors.reduce((acc, doc) => acc + doc.patient_count, 0)}
                        </div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total Patients Tracked</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[16px] shadow-clinical-soft border border-[#CBD5E1] border-t-[4px] border-t-[#0F172A] overflow-hidden">
                <div className="px-8 py-6 border-b border-[#F1F5F9] bg-gray-50/50">
                    <h3 className="text-lg font-bold text-[#0F172A]">
                        Medical Professionals Directory
                    </h3>
                    <p className="text-sm text-[#64748B] mt-1">Active doctor accounts and their associated patient rosters.</p>
                </div>

                {doctors.length === 0 ? (
                    <div className="p-16 text-center text-[#64748B]">
                        <div className="w-16 h-16 rounded-[16px] bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                            <Users className="h-8 w-8 text-[#94A3B8]" />
                        </div>
                        <h4 className="text-[#0F172A] font-semibold text-lg mb-2">No Doctors Registered Yet</h4>
                        <p className="text-sm max-w-sm mx-auto">When medical professionals join the platform, their details will appear here.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#F1F5F9]">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="transition-colors hover:bg-gray-50/30">
                                <div 
                                    className="px-8 py-6 flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleExpand(doctor.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#0F172A] font-bold">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0F172A]">{doctor.name}</h4>
                                            <p className="text-xs text-[#64748B] font-medium uppercase tracking-tight">{doctor.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-[#0F172A]">{doctor.patient_count} Patients</div>
                                            <div className="text-[10px] text-[#94A3B8] font-bold uppercase">Associated Records</div>
                                        </div>
                                        {expandedDoctor === doctor.id ? (
                                            <ChevronUp className="h-5 w-5 text-[#94A3B8]" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-[#94A3B8]" />
                                        )}
                                    </div>
                                </div>

                                {expandedDoctor === doctor.id && (
                                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                                        <div className="bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] overflow-hidden">
                                            <div className="px-4 py-3 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center gap-2">
                                                <User className="h-4 w-4 text-[#64748B]" />
                                                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Patient Roster (Read-Only)</span>
                                            </div>
                                            {doctor.patients.length === 0 ? (
                                                <div className="p-6 text-center text-[#94A3B8] italic text-sm">
                                                    This doctor has not added any patients yet.
                                                </div>
                                            ) : (
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-[#E2E8F0]">
                                                            <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Patient Name</th>
                                                            <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Profile</th>
                                                            <th className="px-4 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Admitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#E2E8F0]">
                                                        {doctor.patients.map((patient) => (
                                                            <tr key={patient.id} className="hover:bg-white/50 transition-colors">
                                                                <td className="px-4 py-3 font-semibold text-[#0F172A] text-sm">{patient.name}</td>
                                                                <td className="px-4 py-3 text-xs text-[#64748B]">
                                                                    {patient.age}y • {patient.gender}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-1 text-xs text-[#64748B]">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {new Date(patient.admission_date).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardAdmin;
