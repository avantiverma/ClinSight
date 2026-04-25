import { Bell, AlertTriangle, Activity, Info } from 'lucide-react';

const Alerts = () => {
    const alerts = [
        {
            id: 1,
            title: "Critical: High Risk ICU Admission",
            message: "A new assessment for 'Satish Sharma' has identified a 78.4% probability for ICU necessity. Immediate clinical review is recommended.",
            time: "10 mins ago",
            type: "critical",
            icon: AlertTriangle
        },
        {
            id: 2,
            title: "Intelligence Model Update",
            message: "The 'ICU Auto-Triage Model' has been successfully updated to version 2.4.1. Predictive accuracy has been enhanced across geriatric patient cohorts.",
            time: "2 hours ago",
            type: "info",
            icon: Info
        },
        {
            id: 3,
            title: "Alert: Prolonged LOS Forecast",
            message: "The latest prediction for 'Priya Sharma' indicates a high probability for a hospital stay exceeding 3 days. Postoperative bed allocation may need adjustment.",
            time: "Yesterday",
            type: "warning",
            icon: Activity
        }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-50 rounded-xl text-red-600 shadow-sm border border-red-100">
                    <Bell className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Clinical Notifications</h1>
                    <p className="text-[#64748B] text-sm font-medium">Real-time alerts and intelligence updates</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div 
                        key={alert.id}
                        className="bg-white p-6 rounded-[20px] shadow-clinical-soft border border-[#E2E8F0] flex items-start gap-5 transition-all hover:shadow-md hover:-translate-y-0.5 group"
                    >
                        <div className={`p-4 rounded-[16px] shrink-0 transition-colors ${
                            alert.type === 'critical' ? 'bg-[#FEF2F2] text-[#EF4444] group-hover:bg-[#EF4444] group-hover:text-white' :
                            alert.type === 'warning' ? 'bg-[#FFF7ED] text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white' :
                            'bg-[#F0F7FF] text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white'
                        }`}>
                            <alert.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-bold text-lg ${
                                    alert.type === 'critical' ? 'text-[#991B1B]' : 'text-[#0F172A]'
                                }`}>{alert.title}</h3>
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{alert.time}</span>
                            </div>
                            <p className="text-[#475569] font-medium text-sm leading-relaxed">{alert.message}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 p-16 text-center border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-gray-50/30">
                <p className="text-[#94A3B8] font-bold text-xs uppercase tracking-[0.2em]">End of Notification Stream</p>
            </div>
        </div>
    );
};

export default Alerts;
