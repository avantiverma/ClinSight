import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Stethoscope } from 'lucide-react';
import { predictLOS } from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';

const PredictLOS = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        op_duration_min: 0,
        intraop_rocu: 0,
        optype_Colorectal: 0,
        optype_Vascular: 0,
        aline1: 0,
        preop_alb: 3.5,
        intraop_crystalloid: 0,
        intraop_uo: 0,
        cormack_Easy: 1,
        optype_Stomach: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : parseInt(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!id) throw new Error('Patient ID missing');
            const result = await predictLOS(id, formData);
            navigate(`/patients/${id}/results`, {
                state: {
                    result: result.data,
                    type: 'Length of Stay (>= 3 Days)',
                    inputs: formData
                }
            });
        } catch (err: any) {
            console.error(err);
            setError('Prediction failed. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    // Helper for input styling
    const inputStyle = `block w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200 no-spinner`;
    const getFocusStyles = (e: React.FocusEvent<HTMLElement>) => e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,0.15)';
    const getBlurStyles = (e: React.FocusEvent<HTMLElement>) => e.target.style.boxShadow = 'none';

    return (
        <div className="max-w-4xl mx-auto w-full pb-12 pt-4">
            <Breadcrumb currentStep={2} />

            <div className="bg-[#F0FDFA] p-6 md:p-8 rounded-[24px] shadow-sm">
                <div className="bg-[#FFFFFF] rounded-[16px] shadow-clinical-soft border border-[#CBD5E1] border-t-[4px] border-t-[#0D9488] overflow-hidden">
                    <div className="bg-[#0D9488]/90 px-8 pt-6 pb-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <Clock className="w-6 h-6 text-white" />
                            <h1 className="text-xl font-bold text-white tracking-wide">Length of Stay Risk Assessment</h1>
                        </div>
                        {/* Soft wave effect */}
                        <div className="absolute bottom-[-12px] left-[-10%] right-[-10%] h-8 bg-white rounded-t-[50%] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pb-10 space-y-10">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-[8px] text-sm border border-red-100 flex items-center">
                                {error}
                            </div>
                        )}

                        {/* Vitals & Demographics */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 mb-6">
                                <Stethoscope className="w-5 h-5 text-clinical-secondary" />
                                <h3 className="text-base font-bold text-clinical-text">Patient Vitals</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Preop Albumin (g/dL)</label>
                                    <input type="number" step="0.1" name="preop_alb" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.preop_alb} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Cormack Grade Easy?</label>
                                    <select name="cormack_Easy" className={`${inputStyle} appearance-none bg-no-repeat`}
                                        style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                                        onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.cormack_Easy} onChange={handleChange}>
                                        <option value={0}>No (Difficult)</option>
                                        <option value={1}>Yes (Easy)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Intraoperative Metrics */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 mb-6">
                                <div className="w-1.5 h-5 bg-[#8B5CF6] rounded-full"></div>
                                <h3 className="text-base font-bold text-clinical-text">Intraoperative Metrics</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Op Duration (min)</label>
                                    <input type="number" name="op_duration_min" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.op_duration_min} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Rocuronium (mg)</label>
                                    <input type="number" step="0.1" name="intraop_rocu" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_rocu} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Crystalloids (ml)</label>
                                    <input type="number" step="1" name="intraop_crystalloid" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_crystalloid} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Urine Output (ml)</label>
                                    <input type="number" step="1" name="intraop_uo" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_uo} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Procedure Type & Access */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 mb-6">
                                <div className="w-1.5 h-5 bg-clinical-primary rounded-full"></div>
                                <h3 className="text-base font-bold text-clinical-text">Procedure Type & Access</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Colorectal Surgery?</label>
                                    <select name="optype_Colorectal" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.optype_Colorectal} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Vascular Surgery?</label>
                                    <select name="optype_Vascular" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.optype_Vascular} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Stomach Surgery?</label>
                                    <select name="optype_Stomach" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.optype_Stomach} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Arterial Line (A-Line)?</label>
                                    <select name="aline1" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.aline1} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8 border-t border-[#F1F5F9] mt-8 relative z-10">
                            <button type="button" onClick={() => navigate(-1)} className="px-[28px] py-[12px] bg-white border border-[#CBD5E1] text-[#475569] hover:bg-gray-50 rounded-[10px] text-sm font-semibold transition-colors">
                                Back
                            </button>
                            <button type="submit" disabled={loading} className="px-[28px] py-[12px] bg-[#0D9488] hover:bg-[#0B7A70] text-white rounded-[10px] text-sm font-semibold transition-transform hover:-translate-y-[1px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                {loading ? 'Analyzing...' : 'Run Prediction'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PredictLOS;
