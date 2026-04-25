import { Document, Page, Text, View, StyleSheet, Svg, Circle, Path } from '@react-pdf/renderer';

// Register a standard font if needed, otherwise use Helvetica by default
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#111827', // slate-900
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#111827',
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280', // gray-500
        textTransform: 'uppercase',
        marginTop: 4,
        letterSpacing: 1,
    },
    metaText: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 2,
    },
    section: {
        marginVertical: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold', // Helvetica bold
        color: '#9CA3AF', // gray-400
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // gray-200
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    col: {
        flexGrow: 1,
        flexDirection: 'column',
    },
    label: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 2,
    },
    value: {
        fontSize: 11,
        color: '#111827',
    },
    riskSection: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB', // gray-50
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    riskIndicator: {
        width: 80,
        height: 80,
        marginRight: 20,
        position: 'relative',
    },
    gaugeText: {
        position: 'absolute',
        top: 30,
        left: 0,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    riskLabel: {
        fontSize: 8,
        color: '#6B7280',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    riskDescription: {
        flex: 1,
        fontSize: 10,
        color: '#4B5563', // gray-600
        lineHeight: 1.5,
    },
    chartContainer: {
        marginTop: 10,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    barLabel: {
        width: '35%',
        fontSize: 9,
        color: '#374151', // gray-700
    },
    barWrapper: {
        width: '50%',
        height: 6,
        backgroundColor: '#F3F4F6', // gray-100
        borderRadius: 3,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    barValue: {
        width: '15%',
        fontSize: 9,
        color: '#9CA3AF', // gray-400
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 4,
    },
});

interface TopFeature {
    feature: string;
    contribution: number;
}

interface PredictionResponse {
    probability: number;
    top_features: TopFeature[];
    prediction_time?: number;
}

interface PatientData {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    admission_date: string;
}

interface PredictionReportPDFProps {
    patient: PatientData | null;
    doctorName: string;
    id: string | undefined;
    result: PredictionResponse;
    modelType: string;
    featureNames: Record<string, string>;
    inputs: Record<string, any>;
}

const PredictionReportPDF = ({ patient, doctorName, id, result, modelType, featureNames, inputs }: PredictionReportPDFProps) => {
    const { probability, top_features } = result;

    const percentage = probability * 100;
    const isHighRisk = probability > 0.5;

    const validFeatures = top_features || [];
    const maxContribution = validFeatures.length > 0
        ? Math.max(...validFeatures.map(f => Math.abs(f.contribution)))
        : 1;

    // Risk Colors
    const riskColor = isHighRisk ? '#EF4444' : '#10B981'; // red-500 : emerald-500
    const riskBg = isHighRisk ? '#FEF2F2' : '#ECFDF5'; // red-50 : emerald-50

    // Fix font encoding issue (≥ turns into 'e' in Helvetica)
    const safeModelType = modelType.replace('≥', '>=');

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Clinical Report</Text>
                        <Text style={styles.subtitle}>Confidential Medical Record</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={{ ...styles.metaText, fontWeight: 'bold' }}>{safeModelType}</Text>
                        <Text style={styles.metaText}>Generated: {new Date().toLocaleDateString()}</Text>
                        <Text style={styles.metaText}>ID: {id}</Text>
                    </View>
                </View>

                {/* Patient & Context Grid */}
                <View style={{ flexDirection: 'row', gap: 20 }}>
                    {/* Patient Details */}
                    <View style={{ ...styles.col, flex: 2 }}>
                        <Text style={styles.sectionTitle}>Patient Demographics</Text>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Full Name</Text>
                                <Text style={styles.value}>{patient?.name || 'Unknown'}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Age / Gender</Text>
                                <Text style={styles.value}>{patient?.age} yrs / {patient?.gender}</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Contact</Text>
                                <Text style={styles.value}>{patient?.phone || 'N/A'}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Admission Date</Text>
                                <Text style={styles.value}>
                                    {patient?.admission_date ? new Date(patient.admission_date).toLocaleDateString() : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Clinical Context */}
                    <View style={{ ...styles.col, flex: 1, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 4 }}>
                        <Text style={styles.sectionTitle}>Clinical Context</Text>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.label}>Attending Doctor</Text>
                            <Text style={styles.value}>Dr. {doctorName}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Facility / Unit</Text>
                            <Text style={styles.value}>General Care</Text>
                        </View>
                    </View>
                </View>

                {/* Prediction Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prediction Analysis</Text>

                    <View style={{ ...styles.riskSection, backgroundColor: riskBg }}>
                        <View style={styles.riskIndicator}>
                            {(() => {
                                // Arc gauge using Path — @react-pdf/renderer does not support strokeDashoffset on Circle
                                const cx = 40, cy = 40, r = 34;
                                const clampedP = Math.min(Math.max(probability, 0.001), 0.999);
                                const angle = clampedP * 2 * Math.PI;
                                const startX = cx;
                                const startY = cy - r;
                                const endX = cx + r * Math.sin(angle);
                                const endY = cy - r * Math.cos(angle);
                                const largeArc = clampedP > 0.5 ? 1 : 0;
                                const arcPath = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
                                return (
                                    <Svg width="80" height="80" viewBox="0 0 80 80">
                                        {/* Gray track */}
                                        <Circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                                        {/* Colored arc */}
                                        <Path d={arcPath} stroke={riskColor} strokeWidth="8" fill="none" strokeLinecap="round" />
                                    </Svg>
                                );
                            })()}
                            <Text style={{ ...styles.gaugeText, color: riskColor }}>
                                {percentage.toFixed(1)}%
                            </Text>
                        </View>
                        <View style={styles.riskDescription}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: riskColor, marginBottom: 4 }}>
                                {isHighRisk ? 'HIGH RISK DETECTED' : 'LOW RISK ASSESSMENT'}
                            </Text>
                            <Text>
                                {isHighRisk
                                    ? "The model detected significant indicators for adverse outcomes based on the provided clinical parameters."
                                    : "The model indicates a low probability of adverse outcomes. Continue standard monitoring protocols."
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Clinical Parameters (Input Values) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Clinical Parameters</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {Object.entries(inputs).map(([key, value]) => {
                            // Skip internal/empty keys if any
                            if (!value && value !== 0) return null;

                            let displayValue = value.toString();
                            // Format booleans/0/1 if they are "Yes/No" fields in featureNames
                            // (Heuristic: typical boolean fields)
                            if ((value === 0 || value === 1) && (key.includes('type') || key.includes('line') || key.includes('iv') || key.includes('Easy'))) {
                                displayValue = value === 1 ? 'Yes' : 'No';
                            }

                            return (
                                <View key={key} style={{ width: '33%', marginBottom: 10, paddingRight: 10 }}>
                                    <Text style={styles.label}>{featureNames[key] || key}</Text>
                                    <Text style={styles.value}>{displayValue}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Explainability / Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top Contributing Factors Analysis</Text>
                    <View style={styles.chartContainer}>
                        {validFeatures.map((feature, index) => {
                            const relativeStrength = (Math.abs(feature.contribution) / maxContribution) * 100;

                            let barColor = '#EAB308'; // yellow-500
                            if (relativeStrength > 66) barColor = '#EF4444'; // red-500
                            else if (relativeStrength > 33) barColor = '#F97316'; // orange-500

                            return (
                                <View key={index} style={styles.barRow}>
                                    <Text style={styles.barLabel}>{featureNames[feature.feature] || feature.feature}</Text>
                                    <View style={styles.barWrapper}>
                                        <View style={{ ...styles.barFill, width: `${relativeStrength}%`, backgroundColor: barColor }} />
                                    </View>
                                    <Text style={styles.barValue}>{Math.abs(feature.contribution).toFixed(3)}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated by Clinical AI Support System • {new Date().getFullYear()}</Text>
                    <Text style={styles.footerText}>
                        This report is computer-generated and is intended for clinical decision support only.
                        Final diagnosis and treatment decisions remain the responsibility of the attending physician.
                    </Text>
                </View>

            </Page>
        </Document>
    );
};

export default PredictionReportPDF;
