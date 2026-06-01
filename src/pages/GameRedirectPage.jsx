import { useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import StickyButton from '../components/StickyButton';

const GAME_URL = import.meta.env.VITE_GAME_URL || 'https://noobgithub0706.github.io/infodemic-survivor/';

export default function GameRedirectPage({ participant, saveData, updateStatus }) {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        await saveData('intervention', {
            type: 'game',
            startedAt: serverTimestamp(),
        });
        await updateStatus('intervention');
        window.location.href = `${GAME_URL}/?id=${participant.id}`;
    };

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
                onClick={handleStart}
                disabled={loading}
                label={loading ? '移動中...' : '課題を開始する'}
            />
        </div>
    );
}
