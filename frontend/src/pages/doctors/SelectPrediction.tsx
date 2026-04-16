import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Clock, ArrowRight } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';

const SelectPrediction = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto w-full pb-12 pt-4">
            <Breadcrumb currentStep={2} />

            <div className="mt-10 text-center mb-10">
                <h1 className="text-2xl font-bold text-clinical-text mb-2">Select Prediction Type</h1>
                <p className="text-clinical-muted text-sm">Choose the risk analysis model for this patient</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ICU Risk Card */}
                <button
                    onClick={() => navigate(`/patients/${id}/predict/icu`)}
                    className="group bg-white p-8 rounded-[12px] shadow-clinical-soft border border-[#E2E8F0] hover:border-clinical-primary hover:shadow-[0_8px_30px_rgba(14,165,233,0.12)] transition-all text-left relative overflow-hidden flex flex-col h-full"
                >
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Activity className="w-48 h-48 text-clinical-primary" />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="w-12 h-12 bg-blue-50 rounded-[10px] flex items-center justify-center mb-6 group-hover:bg-clinical-primary transition-colors">
                            <Activity className="w-6 h-6 text-clinical-primary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-clinical-text mb-3">ICU Admission Risk</h3>
                        <p className="text-clinical-muted text-sm leading-relaxed mb-8 flex-1">
                            Predict the probability of Intensive Care Unit (ICU) admission post-surgery based on perioperative factors.
                        </p>
                        <span className="flex items-center text-clinical-primary font-semibold text-sm group-hover:translate-x-1 transition-transform mt-auto">
                            Start Assessment <ArrowRight className="w-4 h-4 ml-1.5" />
                        </span>
                    </div>
                </button>

                {/* LOS Risk Card */}
                <button
                    onClick={() => navigate(`/patients/${id}/predict/los`)}
                    className="group bg-white p-8 rounded-[12px] shadow-clinical-soft border border-[#E2E8F0] hover:border-clinical-secondary hover:shadow-[0_8px_30px_rgba(13,148,136,0.12)] transition-all text-left relative overflow-hidden flex flex-col h-full"
                >
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Clock className="w-48 h-48 text-clinical-secondary" />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="w-12 h-12 bg-teal-50 rounded-[10px] flex items-center justify-center mb-6 group-hover:bg-clinical-secondary transition-colors">
                            <Clock className="w-6 h-6 text-clinical-secondary group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-xl font-bold text-clinical-text mb-3">Length of Stay (LOS)</h3>
                        <p className="text-clinical-muted text-sm leading-relaxed mb-8 flex-1">
                            Predict the risk of prolonged hospital stay (≥ 3 days) to optimize bed management and resource allocation.
                        </p>
                        <span className="flex items-center text-clinical-secondary font-semibold text-sm group-hover:translate-x-1 transition-transform mt-auto">
                            Start Assessment <ArrowRight className="w-4 h-4 ml-1.5" />
                        </span>
                    </div>
                </button>
            </div>

            <div className="flex justify-center mt-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-medium text-clinical-muted hover:text-clinical-text transition-colors"
                >
                    Cancel and Return
                </button>
            </div>
        </div>
    );
};

export default SelectPrediction
