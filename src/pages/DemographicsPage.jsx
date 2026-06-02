import { useState } from 'react';
import RadioGroup from '../components/RadioGroup';
import LikertScale from '../components/LikertScale';
import StickyButton from '../components/StickyButton';

const INITIAL = {
    age: null,
    snsFrequency: null,
    infoLiteracySelf: null,
};

export default function DemographicsPage({ onComplete }) {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const isValid =
        form.age !== null &&
        form.snsFrequency !== null &&
        form.infoLiteracySelf !== null;

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
                ※ すべての項目が必須です。
            </p>

            <RadioGroup
                label="年齢"
                name="age"
                options={[
                    { value: '18-22', label: '18〜22歳' },
                    { value: '23-29', label: '23〜29歳' },
                    { value: '30-39', label: '30〜39歳' },
                    { value: '40-49', label: '40〜49歳' },
                    { value: '50+',   label: '50歳以上' },
                ]}
                value={form.age}
                onChange={v => set('age', v)}
            />

            <RadioGroup
                label="SNSの利用頻度"
                name="snsFrequency"
                options={[
                    { value: 'multiple_daily', label: '1日に複数回' },
                    { value: 'daily',          label: '毎日1回程度' },
                    { value: 'weekly',         label: '週に数回' },
                    { value: 'monthly',        label: '月に数回' },
                    { value: 'rarely',         label: 'ほぼ使わない' },
                ]}
                value={form.snsFrequency}
                onChange={v => set('snsFrequency', v)}
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

            <StickyButton
                onClick={handleSubmit}
                disabled={!isValid || loading}
                label={loading ? '保存中...' : '次へ'}
            />
        </div>
    );
}
