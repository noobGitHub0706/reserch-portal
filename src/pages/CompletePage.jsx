export default function CompletePage({ participant }) {
    return (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>✓</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px' }}>
                ご参加いただきありがとうございました。
            </h2>
            <p style={{ color: '#555', marginBottom: '12px', lineHeight: '1.7' }}>
                あなたの回答は正常に記録されました。
            </p>
            <p style={{ color: '#555', marginBottom: '32px', lineHeight: '1.7' }}>
                このページを閉じていただいて構いません。
            </p>
            <div style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666',
            }}>
                参加者ID: {participant.id}
            </div>
        </div>
    );
}
