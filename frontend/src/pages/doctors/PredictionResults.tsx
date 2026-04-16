import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Save, Brain, Activity, ArrowRight, Calendar, User, ShieldAlert, CheckCircle2, Users } from 'lucide-react';
import { getPatient, type PatientData } from '../../services/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PredictionReportPDF from './PredictionReportPDF';
import Breadcrumb from '../../components/common/Breadcrumb';

interface TopFeature {
    feature: string;
    contribution: number;
}

interface SimilarCase {
    patient_name: string;
    age: number;
    gender: string;
    similarity_score: number;
    predicted_risk: number;
}

interface PredictionResponse {
    probability: number;
    top_features: TopFeature[];
    similar_cases?: SimilarCase[];
    prediction_time?: number;
}

const FEATURE_NAMES: Record<string, string> = {
    // ICU Features
    cline1: "Central Line",
    aline1: "Arterial Line",
    asa: "ASA Physical Status",
    intraop_rocu: "Intraop Rocuronium",
    ane_duration_min: "Anesthesia Duration",
    iv2: "Two IV Lines",
    optype_Colorectal: "Colorectal Surgery",
    intraop_ca: "Intraop Calcium",
    tubesize: "Endotracheal Tube Size",
    intraop_ppf: "Intraop Propofol",
    preop_alb: "Preop Albumin",
    op_duration_min: "Operation Duration",
    age: "Patient Age",
    intraop_uo: "Intraop Urine Output",
    intraop_ebl: "Est. Blood Loss",

    // LOS Features
    optype_Vascular: "Vascular Surgery",
    optype_Stomach: "Stomach Surgery",
    intraop_crystalloid: "Intraop Crystalloids",
    cormack_Easy: "Cormack-Lehane Grade (Easy)",
};

const PredictionResults = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [patient, setPatient] = useState<PatientData | null>(null);
    const [doctorName, setDoctorName] = useState<string>('Unknown Doctor');
    const [animationTrigger, setAnimationTrigger] = useState(false);

    // Get result from state (passed from prediction form)
    const result = location.state?.result as PredictionResponse;
    const modelType = location.state?.type || 'Risk Assessment';
    const inputs = location.state?.inputs || {};

    useEffect(() => {
        if (id) {
            getPatient(id)
                .then(res => setPatient(res.data))
                .catch(err => console.error("Failed to fetch patient", err));
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setDoctorName(user.name || 'Unknown Doctor');
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }

        // Trigger animations after a short delay
        setTimeout(() => setAnimationTrigger(true), 100);
    }, [id]);

    if (!result) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 p-8">
                <div className="text-center p-10 bg-white rounded-[16px] shadow-clinical-soft border border-[#E2E8F0] max-w-md w-full">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-clinical-muted opacity-50" />
                    </div>
                    <h2 className="text-2xl font-bold text-clinical-text mb-3">No Result Found</h2>
                    <p className="text-clinical-muted mb-8 leading-relaxed">Please run a prediction assessment first to view the analysis report.</p>
                    <button
                        onClick={() => navigate(`/patients/${id}/select-prediction`)}
                        className="w-full px-4 py-3 bg-clinical-primary hover:bg-sky-600 text-white rounded-[8px] font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        Go to Assessment <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Handle legacy DB records safely
    const probability = result?.probability ?? (result as any)?.los_probability ?? 0;
    const top_features: TopFeature[] = result?.top_features ?? [];

    const percentage = probability * 100;
    const isHighRisk = probability > 0.5;

    // Fallback if top_features is somehow undefined
    const validFeatures = top_features;
    const maxContribution = validFeatures.length > 0
        ? Math.max(...validFeatures.map((f: TopFeature) => Math.abs(f.contribution)))
        : 1;

    // Theme colors matching the new Design System
    const themeColor = isHighRisk ? 'text-clinical-danger' : 'text-clinical-success';
    const bgThemeLight = isHighRisk ? 'bg-[#FEF2F2]' : 'bg-[#F0FDF4]';
    const borderTheme = isHighRisk ? 'border-[#FCA5A5]' : 'border-[#86EFAC]';
    const strokeTheme = isHighRisk ? 'stroke-[#EF4444]' : 'stroke-[#10B981]';

    return (
        <div className="max-w-5xl mx-auto w-full pb-16 pt-4 print:p-0 print:absolute print:inset-0 print:w-full">
            <div className="print:hidden mb-8">
                <Breadcrumb currentStep={3} />
            </div>

            <div className="space-y-6">
                {/* Header Actions (Hidden in Print) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden px-2">
                    <div>
                        <div className="flex items-center gap-2 text-[13px] font-medium text-clinical-muted mb-2">
                            <span>ID: {id}</span>
                            <span className="w-1 h-1 rounded-full bg-clinical-muted/30"></span>
                            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-clinical-text">{modelType} Results</h1>
                    </div>
                    <div className="flex gap-3">
                        <PDFDownloadLink
                            document={
                                <PredictionReportPDF
                                    patient={patient}
                                    doctorName={doctorName}
                                    id={id}
                                    result={result}
                                    modelType={modelType}
                                    featureNames={FEATURE_NAMES}
                                    inputs={inputs}
                                />
                            }
                            fileName={`clinical-report-${id}.pdf`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-semibold text-clinical-text hover:bg-gray-50 shadow-sm transition-all"
                        >
                            {({ loading }: any) => (
                                <>
                                    <Download className="w-4 h-4" />
                                    {loading ? 'Preparing...' : 'Download PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-clinical-primary text-white rounded-[8px] text-[13px] font-semibold hover:bg-sky-600 shadow-sm transition-all">
                            <Save className="w-4 h-4" /> Save Record
                        </button>
                    </div>
                </div>

                {/* Risk Banner (New Addition) */}
                <div className={`print:hidden rounded-[12px] p-5 border ${bgThemeLight} ${borderTheme} flex items-start gap-4 mb-2 shadow-sm`}>
                    <div className="mt-0.5">
                        {isHighRisk ? (
                            <ShieldAlert className="w-6 h-6 text-clinical-danger" />
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-clinical-success" />
                        )}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold ${themeColor} uppercase tracking-wider mb-1`}>
                            {isHighRisk ? 'High Risk Alert' : 'Low Risk Indicated'}
                        </h3>
                        <p className={`text-sm ${isHighRisk ? 'text-red-900' : 'text-emerald-900'} leading-relaxed`}>
                            {isHighRisk
                                ? `This patient aligns with high-risk groups for ${modelType.toLowerCase()}. Immediate preventative measures and close monitoring are recommended based on the contributing clinical factors identified below.`
                                : `This patient indicates a low probability for ${modelType.toLowerCase()}. Standard postoperative protocols may be sufficient, pending clinical judgement.`}
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[12px] shadow-clinical-soft border border-[#E2E8F0] overflow-hidden print:shadow-none print:border-0 print:rounded-none">

                    {/* Report Header (Visible Only in Print) */}
                    <div className="bg-slate-900 text-white p-8 print:block hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Clinical AI Report</h1>
                                <p className="text-slate-400 text-sm upppercase tracking-wider font-medium">Confidential Medical Record</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold">{modelType}</p>
                                <p className="text-slate-400 text-sm">Generated: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Section: Demographics & Context */}
                    <div className="grid md:grid-cols-2 border-b border-[#F1F5F9] print:grid-cols-2 print:border-b-2 print:border-gray-800">
                        {/* Demographics */}
                        <div className="p-6 md:p-8 md:border-r border-[#F1F5F9] print:border-none">
                            <h3 className="text-[11px] font-bold text-clinical-muted uppercase tracking-wider mb-5 flex items-center gap-2">
                                <User className="w-4 h-4 text-clinical-primary" /> Patient Demographics
                            </h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Full Name</p>
                                    <p className="text-[15px] font-semibold text-clinical-text">{patient?.name || 'Loading...'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Patient UUID</p>
                                    <p className="text-[13px] font-mono text-clinical-muted truncate" title={id}>{id}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Age / Gender</p>
                                    <p className="text-[15px] font-medium text-clinical-text">{patient?.age} yrs / {patient?.gender}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Contact</p>
                                    <p className="text-[15px] font-medium text-clinical-text">{patient?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Context */}
                        <div className="p-6 md:p-8 bg-gray-50/50 print:bg-white print:border-l-2 print:border-gray-100">
                            <h3 className="text-[11px] font-bold text-clinical-muted uppercase tracking-wider mb-5 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-clinical-secondary" /> Clinical Context
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Attending Physician</p>
                                    <p className="text-[15px] font-semibold text-clinical-text">Dr. {doctorName}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Date of Admission</p>
                                    <p className="text-[15px] font-medium text-clinical-text flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-clinical-muted" />
                                        {patient?.admission_date ? new Date(patient.admission_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Contributing Clinical Factors & Recommendations */}
                    <div className="p-6 md:p-8">
                        <h3 className="text-[11px] font-bold text-clinical-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#8B5CF6]" /> Prediction Analysis Details
                        </h3>

                        <div className="flex flex-col lg:flex-row gap-10 items-start">
                            {/* Gauge Widget */}
                            <div className="w-full lg:w-[35%] flex-shrink-0 print:w-1/3 text-center border border-[#E2E8F0] rounded-[16px] p-8 shadow-sm print:border-2 print:border-gray-200">
                                <div className="text-center mb-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider ${bgThemeLight} ${themeColor} border ${borderTheme} shadow-sm`}>
                                        {isHighRisk && <div className="w-1.5 h-1.5 rounded-full bg-clinical-danger animate-pulse"></div>}
                                        {isHighRisk ? 'High Risk Profile' : 'Target Threshold Met'}
                                    </span>
                                </div>
                                <div className="relative w-48 h-48 mx-auto mb-6">
                                    <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                                        {/* Background Track */}
                                        <circle cx="96" cy="96" r="84" className="stroke-[#F1F5F9]" strokeWidth="16" fill="none" />
                                        {/* Animated Stroke */}
                                        <circle
                                            cx="96" cy="96" r="84"
                                            className={`${strokeTheme} transition-all duration-1500 ease-out`}
                                            strokeWidth="16"
                                            fill="none"
                                            strokeDasharray={2 * Math.PI * 84}
                                            strokeDashoffset={animationTrigger ? (2 * Math.PI * 84) * (1 - probability) : (2 * Math.PI * 84)}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-extrabold ${themeColor} tracking-tight`}>
                                            {animationTrigger ? percentage.toFixed(1) : 0}%
                                        </span>
                                        <span className="text-[11px] mt-1 text-clinical-muted uppercase tracking-widest font-semibold">Probability</span>
                                    </div>
                                </div>
                                <p className="text-sm text-clinical-muted leading-relaxed max-w-[240px] mx-auto">
                                    {isHighRisk
                                        ? "Probability threshold exceeds 50%. Clinical action is highly recommended."
                                        : "Probability remains below the 50% threshold indicating low immediate risk."
                                    }
                                </p>
                            </div>

                            {/* Features Graph & Similar Cases */}
                            <div className="w-full lg:w-[65%] print:w-2/3">
                                <h4 className="text-[13px] font-bold text-clinical-text uppercase tracking-wider mb-6 pb-2 border-b border-[#F1F5F9]">
                                    Top Contributing Clinical Factors
                                </h4>
                                <div className="space-y-5 print:space-y-4">
                                    {validFeatures.map((feature: TopFeature, index: number) => {
                                        const relativeStrength = (Math.abs(feature.contribution) / maxContribution) * 100;

                                        let barColor = 'bg-[#F59E0B]'; // Warning Yellow
                                        if (relativeStrength > 66) barColor = 'bg-[#EF4444]'; // Danger Red
                                        else if (relativeStrength < 33) barColor = 'bg-[#0EA5E9]'; // Primary Blue

                                        return (
                                            <div key={index} className="group">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-[13px] font-semibold text-clinical-text">
                                                        {FEATURE_NAMES[feature.feature] || feature.feature}
                                                    </span>
                                                    <span className="text-[11px] text-clinical-muted font-mono tracking-wider font-medium">
                                                        IMP: {(Math.abs(feature.contribution)).toFixed(3)}
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden print:bg-gray-100 print:border print:border-gray-200">
                                                    <div
                                                        className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                                        style={{ width: animationTrigger ? `${relativeStrength}%` : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Similar Historical Cases Section */}
                                {result.similar_cases && result.similar_cases.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-[13px] font-bold text-clinical-text uppercase tracking-wider mb-4 pb-2 border-b border-[#F1F5F9] flex items-center gap-2">
                                            <Users className="w-4 h-4 text-clinical-primary" /> Relevant Historical Cases (Global Database)
                                        </h4>
                                        <div className="space-y-3">
                                            {result.similar_cases.map((caseItem, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-[#E2E8F0] rounded-[8px] hover:bg-white transition-colors">
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-clinical-text mb-1">
                                                            {caseItem.patient_name} <span className="text-clinical-muted font-normal">({caseItem.age} yrs, {caseItem.gender})</span>
                                                        </p>
                                                        <p className="text-[11px] text-clinical-muted flex items-center gap-1.5">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-clinical-primary"></span>
                                                            {caseItem.similarity_score}% Clinical Match
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] text-clinical-muted uppercase tracking-wider mb-1">Prior Risk Score</p>
                                                        <p className={`text-[15px] font-bold ${caseItem.predicted_risk > 0.5 ? 'text-clinical-danger' : 'text-clinical-success'}`}>
                                                            {(caseItem.predicted_risk * 100).toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer (Visible Only in Print) */}
                    <div className="mt-8 p-8 border-t border-gray-200 text-center hidden print:block">
                        <p className="text-sm text-gray-500 mb-1">Generated by Clinical AI Support System • {new Date().getFullYear()}</p>
                        <p className="text-[10px] text-gray-400">This report is computer-generated and is intended for clinical decision support only. Final diagnosis and treatment decisions remain the responsibility of the attending physician.</p>
                    </div>
                </div>

                {/* Footer Actions (Screen Only) */}
                <div className="flex items-center justify-between pt-6 print:hidden">
                    <button
                        onClick={() => navigate('/dashboard/doctor')}
                        className="flex items-center gap-2 text-sm font-semibold text-clinical-muted hover:text-clinical-text transition-colors py-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
                    </button>

                    <button
                        onClick={() => navigate(`/patients/${id}/select-prediction`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50/50 border border-blue-100 text-clinical-primary hover:bg-blue-50 rounded-[8px] text-[13px] font-bold transition-colors"
                    >
                        Assess Another Outcome <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default PredictionResults;
