import { Check } from 'lucide-react';

interface BreadcrumbProps {
    currentStep: 1 | 2 | 3;
}

export default function Breadcrumb({ currentStep }: BreadcrumbProps) {
    const steps = [
        { id: 1, name: 'Patient Info' },
        { id: 2, name: 'Clinical Data' },
        { id: 3, name: 'Results' },
    ];

    return (
        <nav aria-label="Progress" className="mb-8">
            <ol role="list" className="flex items-center justify-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        <div className="flex items-center">
                            <div className={`
                                relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300
                                ${step.id < currentStep ? 'bg-[#10B981]' // Completed
                                    : step.id === currentStep ? 'bg-[#0D9488] shadow-[0_0_12px_rgba(13,148,136,0.3)]' // Active
                                        : 'bg-[#E2E8F0]' // Upcoming
                                }
                            `}>
                                {step.id < currentStep ? (
                                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                ) : (
                                    <span className={`text-sm font-bold ${step.id === currentStep ? 'text-white' : 'text-[#94A3B8]'}`}>
                                        {step.id}
                                    </span>
                                )}
                            </div>
                            <span className={`absolute top-10 -ml-10 w-28 text-center text-[10px] font-bold uppercase tracking-widest
                                ${step.id < currentStep ? 'text-[#10B981]'
                                    : step.id === currentStep ? 'text-[#0D9488]'
                                        : 'text-[#94A3B8]'}
                            `}>
                                {step.name}
                            </span>
                        </div>

                        {/* Line connecting steps */}
                        {stepIdx !== steps.length - 1 && (
                            <div className={`absolute top-4 left-8 -ml-0.5 w-[calc(100%-2rem)] h-0.5 sm:w-[calc(100%-2rem)] sm:ml-0 transition-colors duration-300 ${step.id < currentStep ? 'bg-[#0D9488]' : 'bg-[#E2E8F0]'}`} />
                        )}
                    </li>
                ))}
            </ol>
            <div className="h-4"></div> {/* Spacer for the absolutely positioned text below */}
        </nav>
    );
}
