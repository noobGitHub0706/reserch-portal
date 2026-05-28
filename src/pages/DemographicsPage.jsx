import { useState } from 'react';
import RadioGroup from '../components/RadioGroup';
import LikertScale from '../components/LikertScale';
import StickyButton from '../components/StickyButton';

const INITIAL = {
    age: null,
    gender: null,
    snsUsage: null,
    snsPlatforms: [],
    healthInfoSource: [],
    infoLiteracySelf: null,
    gameExperience: null,
};

export default function DemographicsPage({ onComplete }) {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const isValid =
        form.age !== null &&
        form.gender !== null &&
        form.snsUsage !== null &&
        form.infoLiteracySelf !== null &&
        form.gameExperience !== null;

    const handleSubmit = async () => {
        if (!isValid || loading) return;
        setLoading(true);
        await onComplete(form);
    };

    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                あなたについて教えてください
            </h2>
            <p style={{ color: '#888', marginBottom: '28px', fontSize: '14px' }}>
                ※ SNSの選択項目以外は必須です。
            </p>

            <RadioGroup
                label="年齢"
                name="age"
                options={[
                    { value: '18-22', label: '18〜22歳' },
                    { value: '23-29', label: '23〜29歳' },
                    { value: '30-39', label: '30〜39歳' },
                    { value: '40-49', label: '40〜49歳' },
                    { value: '50plus', label: '50歳以上' },
                ]}
                value={form.age}
                onChange={v => set('age', v)}
            />

            <RadioGroup
                label="性別"
                name="gender"
                options={[
                    { value: 'male', label: '男性' },
                    { value: 'female', label: '女性' },
                    { value: 'other', label: 'その他' },
                    { value: 'no_answer', label: '回答しない' },
                ]}
                value={form.gender}
                onChange={v => set('gender', v)}
            />

            <RadioGroup
                label="SNSの利用頻度"
                name="snsUsage"
                options={[
                    { value: 'multiple_daily', label: '1日に複数回' },
                    { value: 'once_daily', label: '毎日1回程度' },
                    { value: 'few_weekly', label: '週に数回' },
                    { value: 'few_monthly', label: '月に数回' },
                    { value: 'rarely', label: 'ほぼ使わない' },
                ]}
                value={form.snsUsage}
                onChange={v => set('snsUsage', v)}
            />

            <RadioGroup
                label="利用しているSNS（複数選択可）"
                name="snsPlatforms"
                options={[
                    { value: 'twitter', label: 'X (Twitter)' },
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'line', label: 'LINE' },
                    { value: 'youtube', label: 'YouTube' },
                    { value: 'other', label: 'その他' },
                ]}
                value={form.snsPlatforms}
                onChange={v => set('snsPlatforms', v)}
                multiple
            />

            <RadioGroup
                label="健康情報の主な入手先（複数選択可）"
                name="healthInfoSource"
                options={[
                    { value: 'sns', label: 'SNS' },
                    { value: 'news', label: 'ニュースサイト' },
                    { value: 'expert', label: '医師・専門家' },
                    { value: 'family', label: '家族・友人' },
                    { value: 'search', label: '検索エンジン' },
                    { value: 'other', label: 'その他' },
                ]}
                value={form.healthInfoSource}
                onChange={v => set('healthInfoSource', v)}
                multiple
            />

            <LikertScale
                id="infoLiteracy"
                label='「自分はSNS上の情報の真偽を見抜く力がある」と思いますか？'
                min={1}
                max={5}
                minLabel="全くそう思わない"
                maxLabel="非常にそう思う"
                value={form.infoLiteracySelf}
                onChange={v => set('infoLiteracySelf', v)}
            />

            <LikertScale
                id="gameExperience"
                label="普段ゲームをプレイする頻度"
                min={1}
                max={5}
                minLabel="全くしない"
                maxLabel="毎日する"
                value={form.gameExperience}
                onChange={v => set('gameExperience', v)}
            />

            <StickyButton
                onClick={handleSubmit}
                disabled={!isValid || loading}
                label={loading ? '保存中...' : '次へ'}
            />
        </div>
    );
}
