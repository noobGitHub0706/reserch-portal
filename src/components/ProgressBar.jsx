export default function ProgressBar({ current, total }) {
    const pct = total > 1 ? Math.round(((current - 1) / (total - 1)) * 100) : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#999', letterSpacing: '0.02em' }}>進捗</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{current} / {total}</span>
            </div>
            <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: '#555',
                    borderRadius: '2px',
                    transition: 'width 0.35s ease',
                }} />
            </div>
        </div>
    );
}
