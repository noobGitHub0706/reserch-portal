import { useState } from 'react';
import { MEDIATOR_ITEMS } from '../data/mediatorItems';
import LikertScale from '../components/LikertScale';
import StickyButton from '../components/StickyButton';

export default function MediatorPage({ timing, onComplete }) {
    const initialState = Object.fromEntries(MEDIATOR_ITEMS.map(item => [item.id, null]));
    const [responses, setResponses] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const isValid = MEDIATOR_ITEMS.every(item => responses[item.id] !== null);

    const handleSubmit = async () => {
        if (!isValid || loading) return;
        setLoading(true);
        await onComplete(responses);
    };

    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                {timing === 'pre' ? '事前アンケート' : '事後アンケート'}
            </h2>
            <p style={{ color: '#555', marginBottom: '8px', lineHeight: '1.7' }}>
                以下の各文について、どの程度あてはまるか答えてください。
            </p>
            <p style={{ color: '#999', marginBottom: '28px', fontSize: '14px' }}>
                1 = 全くあてはまらない 〜 7 = 非常にあてはまる
            </p>

            {MEDIATOR_ITEMS.map(item => (
                <LikertScale
                    key={item.id}
                    id={`${timing}-${item.id}`}
                    label={item.text}
                    min={1}
                    max={7}
                    minLabel="全くあてはまらない"
                    maxLabel="非常にあてはまる"
                    value={responses[item.id]}
                    onChange={v => setResponses(prev => ({ ...prev, [item.id]: v }))}
                />
            ))}

            <StickyButton
                onClick={handleSubmit}
                disabled={!isValid || loading}
                label={loading ? '保存中...' : '次へ'}
            />
        </div>
    );
}
