import { useState } from 'react';
import StickyButton from '../components/StickyButton';

export default function ConsentPage({ onComplete }) {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!agreed || loading) return;
        setLoading(true);
        await onComplete();
    };

    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                研究へのご協力のお願い
            </h2>
            <p style={{ marginBottom: '20px', lineHeight: '1.7' }}>
                本研究は、SNS上の情報に関する判断力について調査するものです。
            </p>

            <div style={{ backgroundColor: '#f7f7f7', padding: '20px 24px', borderRadius: '8px', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>【研究概要】</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '2.2' }}>
                    <li>所要時間: 約10〜20分（テスト約10分 + 課題約10分）</li>
                    <li>内容: アンケート、情報判断テスト、Web上の課題</li>
                    <li>データの取り扱い: 匿名化して統計的に処理されます</li>
                    <li>参加は任意であり、いつでも中断できます</li>
                </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>【同意事項】</h3>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        style={{ marginTop: '3px', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ lineHeight: '1.7', fontSize: '16px' }}>
                        上記の内容を理解し、研究に参加することに同意します
                    </span>
                </label>
            </div>

            <StickyButton
                onClick={handleSubmit}
                disabled={!agreed || loading}
                label={loading ? '処理中...' : '同意して開始'}
            />
        </div>
    );
}
