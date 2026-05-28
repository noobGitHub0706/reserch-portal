export default function RadioGroup({ label, name, options, value, onChange, multiple = false }) {
    if (multiple) {
        const selected = value || [];
        return (
            <div style={{ marginBottom: '28px' }}>
                {label && (
                    <p style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '500', color: '#222' }}>
                        {label}
                    </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {options.map(opt => {
                        const isSelected = selected.includes(opt.value);
                        return (
                            <label
                                key={opt.value}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '8px 16px',
                                    border: `1.5px solid ${isSelected ? '#333' : '#ddd'}`,
                                    borderRadius: '20px',
                                    backgroundColor: isSelected ? '#eee' : '#fff',
                                    color: isSelected ? '#111' : '#555',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'background-color 0.1s, border-color 0.1s',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    value={opt.value}
                                    checked={isSelected}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            onChange([...selected, opt.value]);
                                        } else {
                                            onChange(selected.filter(v => v !== opt.value));
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                                {opt.label}
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '28px' }}>
            {label && (
                <p style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '500', color: '#222' }}>
                    {label}
                </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {options.map(opt => {
                    const isSelected = value === opt.value;
                    return (
                        <label
                            key={opt.value}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                                border: `1.5px solid ${isSelected ? '#333' : '#ddd'}`,
                                borderRadius: '20px',
                                backgroundColor: isSelected ? '#eee' : '#fff',
                                color: isSelected ? '#111' : '#555',
                                fontSize: '15px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                transition: 'background-color 0.1s, border-color 0.1s',
                            }}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={isSelected}
                                onChange={() => onChange(opt.value)}
                                style={{ display: 'none' }}
                            />
                            {opt.label}
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
