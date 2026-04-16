import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, User, Calendar, Activity, ChevronDown, ChevronUp, FileText, Edit2, Save, X } from 'lucide-react';
import { getPatient, getPatientHistory, updatePatientNotes } from '../../services/api';
import ReactMarkdown from 'react-markdown';


interface TopFeature {
    feature: string;
    contribution: number;
}

interface PredictionResult {
    probability: number;
    top_features: TopFeature[];
    prediction_time?: number;
}

interface PredictionHistoryRecord {
    id: string;
    model_type: string;
    input_data: Record<string, any>;
    prediction_result: PredictionResult;
    timestamp: string;
}

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    admission_date: string;
    doctor_id: string;
    clinical_notes?: string;
}

const PatientHistoryDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<PredictionHistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedInputs, setExpandedInputs] = useState<Record<string, boolean>>({});

    const [editMode, setEditMode] = useState(false);
    const [notesDraft, setNotesDraft] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Fetch patient details and their prediction history concurrently
                const [patientRes, historyRes] = await Promise.all([
                    getPatient(id),
                    getPatientHistory(id)
                ]);

                setPatient(patientRes.data);
                setNotesDraft(patientRes.data.clinical_notes || '');

                // Sort history by timestamp newest first
                const sortedHistory = historyRes.data.sort((a: PredictionHistoryRecord, b: PredictionHistoryRecord) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                setHistory(sortedHistory);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching patient details:', err);
                setError('Failed to load patient details. They may not exist or you do not have permission.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const toggleInputs = (recordId: string) => {
        setExpandedInputs(prev => ({
            ...prev,
            [recordId]: !prev[recordId]
        }));
    };

    const handleSaveNotes = async () => {
        if (!id) return;
        setSavingNotes(true);
        try {
            await updatePatientNotes(id, notesDraft);
            setPatient(prev => prev ? { ...prev, clinical_notes: notesDraft } : null);
            setEditMode(false);
        } catch (err) {
            console.error('Error saving notes:', err);
            alert('Failed to save notes.');
        } finally {
            setSavingNotes(false);
        }
    };

    const getRiskColor = (prob: number, type: string) => {
        const percentage = Math.round(prob * 100);
        if (percentage >= 70) return 'text-red-700 bg-red-50 border-red-200';
        if (percentage >= 40) return 'text-orange-700 bg-orange-50 border-orange-200';
        return type === 'ICU' ? 'text-green-700 bg-green-50 border-green-200' : 'text-slate-700 bg-slate-50 border-slate-200';
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinical-primary"></div>
                <span className="ml-3 text-slate-600">Loading patient details...</span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error || 'Patient not found'}</h3>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/pages/history')}
                    className="text-clinical-primary hover:text-sky-700 font-medium"
                >
                    &larr; Back to Patient List
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate('/patients/history')}
                className="mb-6 text-sm text-clinical-primary hover:text-sky-700 font-medium flex items-center"
            >
                &larr; Back to Patient List
            </button>

            {/* Patient Header Card */}
            <div className="bg-white shadow rounded-lg px-6 py-5 mb-8 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        ID: {patient.id.split('-')[0]}...
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center text-slate-600">
                        <User className="h-5 w-5 mr-3 text-slate-400" />
                        <span>{patient.age} years old, {patient.gender}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                        <Calendar className="h-5 w-5 mr-3 text-slate-400" />
                        <span>Admitted: {new Date(patient.admission_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Master Clinical Notes Section */}
            <div className="bg-white shadow rounded-lg mb-8 border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-teal-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-teal-600" />
                        Clinical Notes
                    </h2>
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-md transition-colors"
                        >
                            <Edit2 className="h-4 w-4" /> Add Note
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setNotesDraft(patient.clinical_notes || '');
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" /> {savingNotes ? 'Saving...' : 'Save Draft'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {editMode ? (
                        <div>
                            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Edit Notes (Markdown formatting supported)</p>
                            <textarea
                                value={notesDraft}
                                onChange={(e) => setNotesDraft(e.target.value)}
                                className="w-full h-80 p-4 bg-slate-50 border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                                placeholder="Write your clinical notes here... AI summaries will automatically append below this."
                            />
                        </div>
                    ) : (
                        <div className="prose prose-teal max-w-none text-slate-700 text-sm">
                            {patient.clinical_notes ? (
                                <ReactMarkdown>{patient.clinical_notes}</ReactMarkdown>
                            ) : (
                                <p className="text-slate-500 italic text-center py-6">No clinical notes recorded yet. Generate a prediction to get an AI summary, or click "Add Note" to write your own.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-clinical-secondary" />
                Prediction History Timeline
            </h2>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-white shadow rounded-lg border border-slate-200">
                    <p className="text-slate-500">No predictions have been run for this patient yet.</p>
                    <button
                        onClick={() => navigate(`/patients/${patient.id}/select-prediction`)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-clinical-secondary hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinical-secondary"
                    >
                        Run New Prediction
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {history.map((record) => {
                        const isICU = record.model_type === 'ICU';
                        const isExpanded = expandedInputs[record.id] || false;
                        const probPercentage = Math.round(record.prediction_result.probability * 100);
                        const riskClass = getRiskColor(record.prediction_result.probability, record.model_type);

                        return (
                            <div key={record.id} className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                                {/* Header Section */}
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                                            {isICU ? 'ICU Admission Risk' : 'Length of Stay (≥ 3 days) Risk'}
                                            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-medium border ${riskClass}`}>
                                                {probPercentage}% Risk
                                            </span>
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Ran on {new Date(record.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono">
                                        Model: {record.model_type}
                                    </div>
                                </div>

                                {/* Top Features Section */}
                                <div className="px-6 py-5">
                                    <h4 className="text-sm font-medium text-slate-900 uppercase tracking-wider mb-4">
                                        Top 5 Driven By:
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {record.prediction_result.top_features.map((feature, idx) => (
                                            <div key={idx} className="bg-slate-50 rounded-md p-3 border border-slate-100 flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-700 truncate mr-2" title={feature.feature}>
                                                    {idx + 1}. {feature.feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Collapsible Inputs Section */}
                                <div className="border-t border-slate-200">
                                    <button
                                        onClick={() => toggleInputs(record.id)}
                                        className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
                                    >
                                        <span>View Clinical Inputs ({Object.keys(record.input_data).length} parameters)</span>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                                                {Object.entries(record.input_data).map(([key, value]) => (
                                                    <div key={key} className="flex flex-col">
                                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                            {key}
                                                        </span>
                                                        <span className="text-sm text-slate-900">
                                                            {value.toString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PatientHistoryDetail;
