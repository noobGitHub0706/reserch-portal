export default function SNSPostCard({ post, textOnly = false }) {
    return (
        <div style={{
            border: '1px solid #d8d8d8',
            borderRadius: '10px',
            padding: '20px 24px',
            marginBottom: '24px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
            {!textOnly && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#222' }}>{post.account}</div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{post.accountId}</div>
                </div>
            )}
            <div style={{
                whiteSpace: 'pre-wrap',
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#333',
            }}>
                {post.text}
            </div>
        </div>
    );
}
