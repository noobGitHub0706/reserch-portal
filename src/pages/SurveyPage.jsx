import { useState } from 'react';
import LikertScale from '../components/LikertScale';
import RadioGroup from '../components/RadioGroup';
import StickyButton from '../components/StickyButton';

const INITIAL_EXPERIMENTAL = {
    enjoyment: null,
    immersion: null,
    difficulty: null,
    learning: null,
    recommendation: null,
    ch1_difficulty: null,
    ch2_difficulty: null,
    ch3_difficulty: null,
    mostDifficultTechnique: null,
    mostUsefulActivity: null,
    freeText: '',
};

const INITIAL_CONTROL = {
    difficulty: null,
    learning: null,
    freeText: '',
};

function isCompleteExperimental(f) {
    return (
        f.enjoyment !== null &&
        f.immersion !== null &&
        f.difficulty !== null &&
        f.learning !== null &&
        f.recommendation !== null &&
        f.ch1_difficulty !== null &&
        f.ch2_difficulty !== null &&
        f.ch3_difficulty !== null &&
        f.mostDifficultTechnique !== null &&
        f.mostUsefulActivity !== null
    );
}

function isCompleteControl(f) {
    return f.difficulty !== null && f.learning !== null;
}

const SECTION_DIVIDER = { borderTop: '1px solid #eee', marginTop: '12px', paddingTop: '28px' };

export default function SurveyPage({ participant, saveData, updateStatus }) {
    const isExperimental = participant.condition === 'experimental';
    const [form, setForm] = useState(isExperimental ? INITIAL_EXPERIMENTAL : INITIAL_CONTROL);
    const [loading, setLoading] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const isValid = isExperimental ? isCompleteExperimental(form) : isCompleteControl(form);

    const handleSubmit = async () => {
        if (!isValid || loading) return;
        setLoading(true);
        await saveData('survey', form);
        await updateStatus('complete');
    };

    const FreeText = (
        <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px', color: '#222' }}>
                自由記述（任意）
            </p>
            <textarea
                value={form.freeText}
                onChange={e => set('freeText', e.target.value)}
                rows={4}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                }}
                placeholder="感想、気づいたこと、改善点などをご自由にお書きください。"
            />
        </div>
    );

    if (isExperimental) {
        return (
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>最後のアンケート</h2>
                <p style={{ color: '#666', marginBottom: '28px' }}>
                    最後にいくつか質問にお答えください。
                </p>

                <LikertScale id="enjoyment" label="課題はどの程度楽しかったですか？" min={1} max={5}
                    minLabel="全く楽しくない" maxLabel="非常に楽しい" value={form.enjoyment} onChange={v => set('enjoyment', v)} />
                <LikertScale id="immersion" label="課題への没入感はどの程度でしたか？" min={1} max={5}
                    minLabel="全く没入しなかった" maxLabel="非常に没入した" value={form.immersion} onChange={v => set('immersion', v)} />
                <LikertScale id="difficulty" label="課題の難易度はどの程度でしたか？" min={1} max={5}
                    minLabel="非常に簡単" maxLabel="非常に難しい" value={form.difficulty} onChange={v => set('difficulty', v)} />
                <LikertScale id="learning" label="課題を通じて学びがあったと感じますか？" min={1} max={5}
                    minLabel="全く感じない" maxLabel="非常に感じる" value={form.learning} onChange={v => set('learning', v)} />
                <LikertScale id="recommendation" label="この課題を他の人にも勧めたいと思いますか？" min={1} max={5}
                    minLabel="全く勧めない" maxLabel="強く勧めたい" value={form.recommendation} onChange={v => set('recommendation', v)} />

                <div style={SECTION_DIVIDER}>
                    <LikertScale id="ch1_difficulty" label="第1章の内容は、操作的だと見抜きやすかったですか？"
                        min={1} max={7} minLabel="非常に難しかった" maxLabel="非常に見抜きやすかった"
                        value={form.ch1_difficulty} onChange={v => set('ch1_difficulty', v)} />
                    <LikertScale id="ch2_difficulty" label="第2章の内容は、操作的だと見抜きやすかったですか？"
                        min={1} max={7} minLabel="非常に難しかった" maxLabel="非常に見抜きやすかった"
                        value={form.ch2_difficulty} onChange={v => set('ch2_difficulty', v)} />
                    <LikertScale id="ch3_difficulty" label="第3章の内容は、操作的だと見抜きやすかったですか？"
                        min={1} max={7} minLabel="非常に難しかった" maxLabel="非常に見抜きやすかった"
                        value={form.ch3_difficulty} onChange={v => set('ch3_difficulty', v)} />
                </div>

                <div style={SECTION_DIVIDER}>
                    <RadioGroup
                        label="最も見破りにくかった技法はどれですか？"
                        name="mostDifficultTechnique"
                        options={[
                            { value: 'fear', label: '恐怖訴求' },
                            { value: 'authority', label: '権威訴求' },
                            { value: 'fabricated_evidence', label: '根拠の捏造・歪曲' },
                            { value: 'testimonial', label: '証言利用' },
                            { value: 'social_proof', label: '社会的証明' },
                            { value: 'none', label: '特になし' },
                        ]}
                        value={form.mostDifficultTechnique}
                        onChange={v => set('mostDifficultTechnique', v)}
                    />

                    <RadioGroup
                        label="最も学びになった活動はどれですか？"
                        name="mostUsefulActivity"
                        options={[
                            { value: 'rhetoric_quiz', label: '技法識別' },
                            { value: 'influencer_sim', label: '発信体験' },
                            { value: 'fact_check', label: '情報検証' },
                            { value: 'boss', label: 'ボス戦' },
                            { value: 'none', label: '特になし' },
                        ]}
                        value={form.mostUsefulActivity}
                        onChange={v => set('mostUsefulActivity', v)}
                    />
                </div>

                <div style={SECTION_DIVIDER}>
                    {FreeText}
                </div>

                <StickyButton
                    onClick={handleSubmit}
                    disabled={!isValid || loading}
                    label={loading ? '送信中...' : '送信'}
                />
            </div>
        );
    }

    // 対照群
    return (
        <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>最後のアンケート</h2>
            <p style={{ color: '#666', marginBottom: '28px' }}>
                最後にいくつか質問にお答えください。
            </p>

            <LikertScale id="difficulty" label="読解課題の難易度はどの程度でしたか？" min={1} max={5}
                minLabel="非常に簡単" maxLabel="非常に難しい" value={form.difficulty} onChange={v => set('difficulty', v)} />
            <LikertScale id="learning" label="読解課題を通じて学びがあったと感じますか？" min={1} max={5}
                minLabel="全く感じない" maxLabel="非常に感じる" value={form.learning} onChange={v => set('learning', v)} />

            <div style={SECTION_DIVIDER}>
                {FreeText}
            </div>

            <StickyButton
                onClick={handleSubmit}
                disabled={!isValid || loading}
                label={loading ? '送信中...' : '送信'}
            />
        </div>
    );
}
