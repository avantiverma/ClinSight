import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Users, AlertTriangle, Clock, ArrowRight, FileText, Activity } from 'lucide-react';
import { getMyPatients } from '../services/api';

// Reuse interface from PatientHistory
interface TopFeature {
    feature: string;
    contribution: number;
}
interface PredictionResult {
    probability: number;
    top_features: TopFeature[];
    prediction_time?: number;
}
interface PatientSummary {
    id: string;
    latest_icu_prediction: PredictionResult | null;
    latest_los_prediction: PredictionResult | null;
}

const DashboardDoctor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const displayName = user?.name
        ? (user.name.toLowerCase().includes('dr') ? user.name : `Dr. ${user.name.split(' ')[0]}`)
        : 'Doctor';

    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await getMyPatients();
                setPatients(response.data);
            } catch (err) {
                console.error("Error fetching dashboard patients:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Derived metrics
    const totalPatients = patients.length;
    const highRiskICU = patients.filter(p => (p.latest_icu_prediction?.probability || 0) >= 0.7).length;
    const highRiskLOS = patients.filter(p => (p.latest_los_prediction?.probability || 0) >= 0.7).length;

    return (
        <div className="max-w-7xl mx-auto w-full pb-12">
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-clinical-text tracking-tight">
                    Good morning, {displayName}
                </h1>
                <p className="mt-1.5 text-clinical-muted text-sm font-medium">
                    {today}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#0EA5E9]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#F0F7FF] flex items-center justify-center shrink-0 group-hover:bg-[#0EA5E9] transition-colors">
                        <Users className="h-6 w-6 text-[#0EA5E9] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">{loading ? '-' : totalPatients}</div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">Total Patients</div>
                    </div>
                </div>

                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#EF4444]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#FEF2F2] flex items-center justify-center shrink-0 group-hover:bg-[#EF4444] transition-colors">
                        <AlertTriangle className="h-6 w-6 text-[#EF4444] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">{loading ? '-' : highRiskICU}</div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">High Risk ICU</div>
                    </div>
                </div>

                <div className="bg-white rounded-[14px] p-6 shadow-clinical-soft border border-[#E2E8F0] flex items-center gap-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] group">
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#F97316]"></div>
                    <div className="w-12 h-12 rounded-[12px] bg-[#FFF7ED] flex items-center justify-center shrink-0 group-hover:bg-[#F97316] transition-colors">
                        <Activity className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-[#0F172A]">{loading ? '-' : highRiskLOS}</div>
                        <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">High Risk LOS</div>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div
                    onClick={() => navigate('/patients/new')}
                    className="cursor-pointer bg-gradient-to-br from-[#0EA5E9] to-[#0D9488] rounded-[16px] p-6 shadow-md transition-all duration-300 hover:shadow-[0_12px_40px_rgba(13,148,136,0.25)] hover:-translate-y-1 group flex flex-col justify-between overflow-hidden relative min-h-[160px]"
                >
                    {/* Decorative background circle */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl"></div>

                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-[12px] bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-transform">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1.5">Start New Patient</h3>
                            <p className="text-blue-50 text-sm leading-relaxed max-w-sm font-medium">
                                Input clinical features for risk prediction.
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-6 right-6 h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm relative z-10 self-end opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="h-4 w-4 text-[#0D9488]" />
                    </div>
                </div>

                <div
                    onClick={() => navigate('/patients/history')}
                    className="cursor-pointer bg-white rounded-[16px] p-6 shadow-clinical-soft border border-[#E2E8F0] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(13,148,136,0.12)] hover:-translate-y-1 group flex flex-col justify-between relative overflow-hidden min-h-[160px]"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex items-start gap-5 relative z-10 w-full">
                        <div className="w-12 h-12 rounded-[12px] bg-[#F0FDFA] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#0D9488]">
                            <FileText className="h-6 w-6 text-[#0D9488] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A] mb-1.5 group-hover:text-[#0D9488] transition-colors">Patient History</h3>
                            <p className="text-sm text-[#64748B] leading-relaxed max-w-sm font-medium">
                                Review past patient analytics and reports.
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-6 right-6 h-8 w-8 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 self-end">
                        <ArrowRight className="h-4 w-4 text-[#0D9488]" />
                    </div>
                </div>
            </div>

            {/* AI Model Status */}
            <div>
                <h2 className="text-lg font-bold text-clinical-text mb-4">AI Model Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[12px] p-6 shadow-clinical-soft border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-clinical-text">ICU Auto-Triage Model</h3>
                                <p className="text-xs text-clinical-muted mt-0.5">Version 2.4.1 • Updated recently</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-md">Operational</span>
                    </div>

                    <div className="bg-white rounded-[12px] p-6 shadow-clinical-soft border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-clinical-text">Length of Stay (LOS) Model</h3>
                                <p className="text-xs text-clinical-muted mt-0.5">Version 1.8.0 • Updated recently</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-md">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardDoctor;
