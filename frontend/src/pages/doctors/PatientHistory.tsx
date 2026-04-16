import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, Activity } from 'lucide-react';
import { getMyPatients } from '../../services/api';

// Keep this in sync with backend schema
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
    name: string;
    age: number;
    gender: string;
    admission_date: string;
    latest_icu_prediction: PredictionResult | null;
    latest_los_prediction: PredictionResult | null;
}

const PatientHistory = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await getMyPatients();
                setPatients(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching patients:', err);
                setError('Failed to load patient history. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Helper functions for badges
    const getICUBadge = (prediction: PredictionResult | null) => {
        if (!prediction) return <span className="text-slate-400 text-sm">Not run</span>;

        const prob = Math.round(prediction.probability * 100);
        let colorClass = "bg-green-100 text-green-800 border-green-200";
        let label = "Low Risk";

        if (prob >= 70) {
            colorClass = "bg-red-100 text-red-800 border-red-200";
            label = "High Risk";
        } else if (prob >= 40) {
            colorClass = "bg-orange-100 text-orange-800 border-orange-200";
            label = "Medium Risk";
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {prob}% ({label})
            </span>
        );
    };

    const getLOSBadge = (prediction: PredictionResult | null) => {
        if (!prediction) return <span className="text-slate-400 text-sm">Not run</span>;

        const prob = Math.round(prediction.probability * 100);
        let colorClass = "bg-slate-100 text-slate-800 border-slate-200";

        if (prob >= 70) {
            colorClass = "bg-red-100 text-red-800 border-red-200";
        } else if (prob >= 40) {
            colorClass = "bg-orange-100 text-orange-800 border-orange-200";
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {prob}% (≥ 3 days)
            </span>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinical-primary"></div>
                <span className="ml-3 text-slate-600">Loading patient history...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex justify-between items-center border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-clinical-secondary" />
                        Patient History
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View all your registered patients and their prediction histories.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/doctor')}
                    className="text-sm text-clinical-primary hover:text-sky-700 font-medium"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {patients.length === 0 && !error ? (
                <div className="text-center py-16 bg-white shadow rounded-lg border border-slate-200">
                    <Activity className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Patients Found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        You haven't added any patients yet.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/patients/new')}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-clinical-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-primary"
                        >
                            Add New Patient
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                    <ul role="list" className="divide-y divide-slate-200">
                        {patients.map((patient) => (
                            <li key={patient.id} className="hover:bg-slate-50 transition-colors">
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-clinical-primary truncate">
                                                {patient.name}
                                            </p>
                                            <div className="ml-2 flex flex-shrink-0">
                                                <p className="text-sm text-slate-500">
                                                    Admitted: {new Date(patient.admission_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex sm:items-center">
                                                <p className="flex items-center text-sm text-slate-500">
                                                    {patient.age} yrs • {patient.gender}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">ICU:</span>
                                                    {getICUBadge(patient.latest_icu_prediction)}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">LOS:</span>
                                                    {getLOSBadge(patient.latest_los_prediction)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => navigate(`/patients/${patient.id}/history`)}
                                            className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-primary"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PatientHistory;
