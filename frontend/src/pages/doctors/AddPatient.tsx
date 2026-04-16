import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Phone, ArrowRight } from 'lucide-react';
import { createPatient, type PatientData } from '../../services/api';
import Breadcrumb from '../../components/common/Breadcrumb';

const AddPatient = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("AddPatient component mounted");
    }, []);

    const [formData, setFormData] = useState<PatientData>({
        name: '',
        age: 0,
        gender: 'Male',
        phone: '',
        admission_date: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                admission_date: `${formData.admission_date}T00:00:00`
            };

            const response = await createPatient(payload);
            if (!response || !response.data || !response.data.id) {
                throw new Error("Failed to get patient ID from response");
            }
            const patientId = response.data.id;
            navigate(`/patients/${patientId}/select-prediction`);
        } catch (err: any) {
            console.error("Submit Error:", err);
            let errorMessage = 'Failed to create patient. Please try again.';

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((e: any) => e.msg).join(', ');
                } else if (typeof detail === 'object') {
                    errorMessage = JSON.stringify(detail);
                } else {
                    errorMessage = String(detail);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full pb-12 pt-4">
            <Breadcrumb currentStep={1} />

            <div className="bg-[#F0F7FF] p-6 md:p-8 rounded-[24px] shadow-sm">
                <div className="bg-[#FFFFFF] rounded-[16px] shadow-clinical-soft border border-[#CBD5E1] border-t-[4px] border-t-[#0D9488] overflow-hidden">
                    <div className="bg-[#0D9488]/90 px-8 pt-6 pb-8 relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <UserPlus className="w-6 h-6 text-white" />
                            <h1 className="text-xl font-bold text-white tracking-wide">Patient Information</h1>
                        </div>
                        {/* Soft wave effect */}
                        <div className="absolute bottom-[-12px] left-[-10%] right-[-10%] h-8 bg-white rounded-t-[50%] z-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pb-10 space-y-8">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-[8px] text-sm border border-red-100 flex items-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 font-medium">@</span>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200"
                                        style={{ boxShadow: '0 0 0 0 transparent' }}
                                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'}
                                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        required
                                        min="0"
                                        max="120"
                                        className="block w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200 no-spinner"
                                        style={{ boxShadow: '0 0 0 0 transparent' }}
                                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'}
                                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Gender</label>
                                    <select
                                        name="gender"
                                        className="block w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200 appearance-none bg-no-repeat"
                                        style={{
                                            boxShadow: '0 0 0 0 transparent',
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230EA5E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundSize: '1.5em 1.5em'
                                        }}
                                        onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'}
                                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="block w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200"
                                            style={{ boxShadow: '0 0 0 0 transparent' }}
                                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'}
                                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Date of Admission</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            name="admission_date"
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] transition-all duration-200"
                                            style={{ boxShadow: '0 0 0 0 transparent' }}
                                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'}
                                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                                            value={formData.admission_date}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-8 border-t border-[#F1F5F9] mt-8 relative z-10">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/doctor')}
                                className="px-[28px] py-[12px] bg-white border border-[#CBD5E1] text-[#475569] hover:bg-gray-50 rounded-[10px] text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-[28px] py-[12px] bg-[#0D9488] hover:bg-[#0B7A70] text-white rounded-[10px] text-sm font-semibold transition-transform hover:-translate-y-[1px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPatient;
