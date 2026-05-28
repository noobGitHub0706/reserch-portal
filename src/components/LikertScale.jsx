export default function LikertScale({ id, label, min = 1, max = 7, minLabel = '', maxLabel = '', centerLabel = '', value, onChange }) {
    const points = Array.from({ length: max - min + 1 }, (_, i) => i + min);

    return (
        <div style={{ marginBottom: '32px' }}>
            {label && (
                <p style={{ marginBottom: '14px', fontSize: '16px', lineHeight: '1.6', color: '#222' }}>
                    {label}
                </p>
            )}
            {(minLabel || maxLabel || centerLabel) && (
                centerLabel ? (
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <span style={{ flex: 1, fontSize: '12px', color: '#999' }}>{minLabel}</span>
                        <span style={{ flex: 1, fontSize: '12px', color: '#999', textAlign: 'center' }}>{centerLabel}</span>
                        <span style={{ flex: 1, fontSize: '12px', color: '#999', textAlign: 'right' }}>{maxLabel}</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>{minLabel}</span>
                        <span style={{ fontSize: '12px', color: '#999' }}>{maxLabel}</span>
                    </div>
                )
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
                {points.map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            height: '48px',
                            border: `1.5px solid ${value === p ? '#374151' : '#ddd'}`,
                            borderRadius: '6px',
                            backgroundColor: value === p ? '#374151' : '#fff',
                            color: value === p ? '#fff' : '#666',
                            fontSize: '15px',
                            fontWeight: value === p ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'background-color 0.1s, border-color 0.1s, color 0.1s',
                            fontFamily: 'inherit',
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
