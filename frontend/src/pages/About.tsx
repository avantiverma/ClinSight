import React from 'react';
import { Database, FileText, Activity } from 'lucide-react';
import aboutBg from '../assets/about-bg.jpg';

const About = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-20 overflow-hidden bg-slate-50">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src={aboutBg}
                    alt="Clinical Background"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50">
                    <h2 className="text-base font-bold text-clinical-primary tracking-widest uppercase mb-4">About ClinSight</h2>
                    <h2 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-8">
                        Precision in Every Prediction
                    </h2>

                    <div className="prose prose-lg mx-auto text-slate-600 mb-12">
                        <p className="mb-6">
                            ClinSight aims to revolutionize perioperative care by providing clinicians with a robust, data-driven second opinion. We understand that recovery is complex, and traditional scores often miss the nuance of individual patient physiology.
                        </p>
                        <p>
                            Our workflow is designed for simplicity and trust:
                        </p>
                    </div>

                    {/* Simple Workflow visual */}
                    <div className="grid md:grid-cols-3 gap-8 text-left mt-10">
                        <WorkflowStep
                            number="01"
                            title="Analyze Features"
                            text="We ingest key perioperative data points—from surgical duration to nutritional markers—capturing the full clinical picture."
                            icon={<FileText className="w-6 h-6 text-clinical-primary" />}
                        />
                        <WorkflowStep
                            number="02"
                            title="AI Processing"
                            text="Our advanced models process this data, comparing it against thousands of historical cases to identify subtle risk patterns."
                            icon={<Database className="w-6 h-6 text-clinical-primary" />}
                        />
                        <WorkflowStep
                            number="03"
                            title="Predict & Plan"
                            text="We deliver a precise risk score for ICU admission and Length of Stay, empowering you to plan resources effectively."
                            icon={<Activity className="w-6 h-6 text-clinical-primary" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowStep = ({ number, title, text, icon }: { number: string; title: string; text: string; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-black text-slate-100">{number}</span>
            <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
            {text}
        </p>
    </div>
);

export default About;
