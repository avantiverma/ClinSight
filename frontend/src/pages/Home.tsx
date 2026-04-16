import { Clock, Brain, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col bg-clinical-bg min-h-full pb-20">
            {/* Minimal Hero Section */}
            <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                {/* Clean Blurred Abstract Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-clinical-bg"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                    <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
                    <div className="lg:max-w-3xl">
                        <h1 className="text-5xl tracking-tight font-extrabold text-clinical-text sm:text-6xl md:text-7xl mb-4">
                            <span className="block text-[#0F172A]">ClinSight</span>
                            <span className="block text-clinical-primary mt-2">Perioperative Intelligence</span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-clinical-muted max-w-2xl leading-relaxed">
                            Support your clinical experience with data-driven insights.
                            We help you accurately predict ICU needs and Length of Stay,
                            enabling smarter resource planning and better patient care.
                        </p>

                        {/* Stat Strip */}
                        <div className="mt-8 flex items-center space-x-4 text-sm font-medium text-clinical-muted">
                            <span>500+ Surgeries Analyzed</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>94% Prediction Accuracy</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>Trusted by 12 Hospitals</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl text-white bg-clinical-primary hover:bg-sky-500 transition-colors shadow-sm"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl text-clinical-text bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards Section */}
            <section className="py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        <FeatureCard
                            icon={<AlertCircle className="h-6 w-6 text-[#EF4444]" />}
                            title="Early Warning"
                            description="Proactively identify patients at high risk of ICU admission before surgery ends. We focus on critical physiological signals to enable timely interventions."
                            borderColor="#EF4444"
                            iconBg="#FEF2F2"
                        />
                        <FeatureCard
                            icon={<Clock className="h-6 w-6 text-[#0D9488]" />}
                            title="Smart Bed Management"
                            description="Accurate Length of Stay forecasting helps hospitals optimize bed capacity. Planning discharge and recovery flows becomes data-driven rather than reactive."
                            borderColor="#0D9488"
                            iconBg="#F0FDFA"
                        />
                        <FeatureCard
                            icon={<Brain className="h-6 w-6 text-[#8B5CF6]" />}
                            title="Trust Through Transparency"
                            description="Every prediction helps you understand the 'Why'. We break down individual risk factors, giving clinicians the confidence to act on AI recommendations."
                            borderColor="#8B5CF6"
                            iconBg="#F5F3FF"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    borderColor: string;
    iconBg: string;
}

const FeatureCard = ({ icon, title, description, borderColor, iconBg }: FeatureCardProps) => (
    <div
        className="bg-white p-8 rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1"
        style={{ borderLeft: `3px solid ${borderColor}`, borderTop: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}
    >
        <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
            style={{ backgroundColor: iconBg }}
        >
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-3">{title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">
            {description}
        </p>
        <div className="mt-6 flex items-center text-sm font-medium" style={{ color: borderColor }}>
            Explore feature <ChevronRight className="w-4 h-4 ml-1" />
        </div>
    </div>
);

export default Home;
