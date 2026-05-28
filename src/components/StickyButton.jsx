export default function StickyButton({ onClick, disabled = false, label = '次へ' }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #eee',
            padding: '12px 20px',
            zIndex: 50,
        }}>
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        fontWeight: '500',
                        backgroundColor: disabled ? '#ddd' : '#222',
                        color: disabled ? '#aaa' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.15s',
                        fontFamily: 'inherit',
                    }}
                >
                    {label}
                </button>
            </div>
        </div>
    );
}
