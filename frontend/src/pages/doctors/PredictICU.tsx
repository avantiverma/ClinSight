import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Stethoscope } from 'lucide-react';
import { predictICU } from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';

const PredictICU = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        cline1: 0,
        aline1: 0,
        asa: 1,
        intraop_rocu: 0,
        ane_duration_min: 0,
        iv2: 0,
        optype_Colorectal: 0,
        intraop_ca: 0,
        tubesize: 7.0,
        intraop_ppf: 0,
        preop_alb: 3.5,
        op_duration_min: 0,
        age: 0,
        intraop_uo: 0,
        intraop_ebl: 0
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
            const result = await predictICU(id, formData);
            navigate(`/patients/${id}/results`, {
                state: {
                    result: result.data,
                    type: 'ICU Admission Risk',
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
    const getFocusStyles = (e: React.FocusEvent<HTMLElement>) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)';
    const getBlurStyles = (e: React.FocusEvent<HTMLElement>) => e.target.style.boxShadow = 'none';

    return (
        <div className="max-w-4xl mx-auto w-full pb-12 pt-4">
            <Breadcrumb currentStep={2} />

            <div className="bg-[#F0F7FF] p-6 md:p-8 rounded-[24px] shadow-sm">
                <div className="bg-[#FFFFFF] rounded-[16px] shadow-clinical-soft border border-[#CBD5E1] border-t-[4px] border-t-[#0D9488] overflow-hidden">
                    <div className="bg-[#0D9488]/90 px-8 pt-6 pb-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <Activity className="w-6 h-6 text-white" />
                            <h1 className="text-xl font-bold text-white tracking-wide">ICU Admission Risk Assessment</h1>
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
                                <Stethoscope className="w-5 h-5 text-clinical-primary" />
                                <h3 className="text-base font-bold text-clinical-text">Patient Demographics & Vitals</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Age</label>
                                    <input type="number" name="age" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.age} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">ASA Physical Status (1-6)</label>
                                    <input type="number" name="asa" min="1" max="6" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.asa} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Preop Albumin (g/dL)</label>
                                    <input type="number" step="0.1" name="preop_alb" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.preop_alb} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Procedure Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 mb-6">
                                <div className="w-1.5 h-5 bg-clinical-secondary rounded-full"></div>
                                <h3 className="text-base font-bold text-clinical-text">Procedure Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Op Duration (min)</label>
                                    <input type="number" name="op_duration_min" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.op_duration_min} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Ane. Duration (min)</label>
                                    <input type="number" name="ane_duration_min" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.ane_duration_min} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Tube Size (mm)</label>
                                    <input type="number" step="0.5" name="tubesize" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.tubesize} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Colorectal Surgery?</label>
                                    <select name="optype_Colorectal" className={`${inputStyle} appearance-none bg-no-repeat`}
                                        style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                                        onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.optype_Colorectal} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:grid-cols-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Rocuronium (mg)</label>
                                    <input type="number" step="0.1" name="intraop_rocu" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_rocu} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Propofol (mg)</label>
                                    <input type="number" step="0.1" name="intraop_ppf" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_ppf} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Calcium (mg)</label>
                                    <input type="number" step="0.1" name="intraop_ca" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_ca} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Urine Output (ml)</label>
                                    <input type="number" step="1" name="intraop_uo" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_uo} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Est. Blood Loss</label>
                                    <input type="number" step="1" name="intraop_ebl" required className={inputStyle} style={{ boxShadow: '0 0 0 0 transparent' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.intraop_ebl} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Lines & Access */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 mb-6">
                                <div className="w-1.5 h-5 bg-[#F59E0B] rounded-full"></div>
                                <h3 className="text-base font-bold text-clinical-text">Lines & Access</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">C-Line?</label>
                                    <select name="cline1" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.cline1} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">A-Line?</label>
                                    <select name="aline1" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.aline1} onChange={handleChange}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Two IV Lines?</label>
                                    <select name="iv2" className={`${inputStyle} appearance-none bg-no-repeat`} style={{ boxShadow: '0 0 0 0 transparent', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }} onFocus={getFocusStyles} onBlur={getBlurStyles} value={formData.iv2} onChange={handleChange}>
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

export default PredictICU;
