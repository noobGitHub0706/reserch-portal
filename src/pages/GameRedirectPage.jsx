import { useState } from 'react';
import StickyButton from '../components/StickyButton';

const GAME_URL = import.meta.env.VITE_GAME_URL || 'https://noobgithub0706.github.io/infodemic-survivor/';

export default function GameRedirectPage({ participant, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const interventionStatus = participant.interventionStatus || 'pending';

    const handleRedirect = async () => {
        setLoading(true);
        await onUpdate({ status: 'intervention', interventionStatus: 'redirected' });
        window.location.href = `${GAME_URL}?id=${participant.id}`;
    };

    const handleAlreadyDone = async () => {
        setLoading(true);
        await onUpdate({ status: 'postTest' });
    };

    if (interventionStatus === 'pending') {
        return (
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>テスト完了</h2>
                <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                    テストが完了しました。
                </p>
                <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                    次のステップとして、Web上の課題に取り組んでいただきます。
                    下のボタンを押すと、別のサイトに移動します。
                </p>
                <p style={{ color: '#888', lineHeight: '1.8', fontSize: '15px' }}>
                    課題が完了したら、自動的にこのページに戻ります。
                    ブラウザを閉じないようにしてください。
                </p>
                <StickyButton
                    onClick={handleRedirect}
                    disabled={loading}
                    label={loading ? '移動中...' : '課題を開始する'}
                />
            </div>
        );
    }

    // interventionStatus === 'redirected': ゲームへ移動済みだが未完了のまま再アクセス
    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>課題の再開</h2>
            <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                課題がまだ完了していないようです。
            </p>
            <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
                下のボタンから課題を再開してください。
                既に完了している場合は「完了済み」を押してください。
            </p>
            <StickyButton
                onClick={handleRedirect}
                disabled={loading}
                label={loading ? '移動中...' : '課題を再開する'}
            />
            <div style={{ marginTop: '12px' }}>
                <button
                    onClick={handleAlreadyDone}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#fff', color: '#555',
                        border: '1.5px solid #ddd', borderRadius: '6px',
                        fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    課題は完了済み（次のステップへ）
                </button>
            </div>
        </div>
    );
}
