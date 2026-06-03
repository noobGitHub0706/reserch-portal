import { useState, useEffect, useMemo } from 'react';
import { TEST_SET_A, TEST_SET_B } from '../data/testSets_v2';
import LikertScale from '../components/LikertScale';
import StickyButton from '../components/StickyButton';

const TEST_SETS = { A: TEST_SET_A, B: TEST_SET_B };

// 決定論的シャッフル用 PRNG (Mulberry32)
function mulberry32(seed) {
    let s = seed >>> 0;
    return () => {
        s += 0x6D2B79F5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function strToSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
}

// Fisher-Yates シャッフル（元の配列を変更しない）
function shuffled(arr, seed) {
    const a = [...arr];
    const rand = mulberry32(seed);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function TestPage({ timing, participant, saveData, updateStatus }) {
    const setKey = timing === 'pre'
        ? participant.testSetOrder[0]
        : participant.testSetOrder[1];

    // 参加者ID × timing でシード生成 → 事前・事後で異なる順序
    const questions = useMemo(() => {
        const seed = strToSeed((participant.id || '') + timing);
        return shuffled(TEST_SETS[setKey], seed);
    }, [participant.id, timing, setKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const [phase, setPhase] = useState('instruction'); // 'instruction' | 'test'
    const [currentIdx, setCurrentIdx] = useState(0);
    const [trustRating, setTrustRating] = useState(null);
    const [shareIntent, setShareIntent] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [displayedAt, setDisplayedAt] = useState(null);
    const [loading, setLoading] = useState(false);

    // 投稿が切り替わるたびに表示時刻を記録し回答をリセット
    useEffect(() => {
        if (phase === 'test') {
            setDisplayedAt(Date.now());
            setTrustRating(null);
            setShareIntent(null);
        }
    }, [phase, currentIdx]);

    const canProceed = trustRating !== null && shareIntent !== null;
    const isLast = currentIdx === questions.length - 1;

    const handleNext = async () => {
        if (!canProceed || loading) return;

        const newAnswer = {
            questionId: questions[currentIdx].id,
            trustRating,
            shareIntent,
            responseTimeMs: Date.now() - displayedAt,
            displayOrder: currentIdx,
        };
        const newAnswers = [...answers, newAnswer];

        if (!isLast) {
            setAnswers(newAnswers);
            setCurrentIdx(prev => prev + 1);
        } else {
            setLoading(true);
            const statusKey = timing === 'pre' ? 'preTest' : 'postTest';
            await saveData(statusKey, { testSet: setKey, answers: newAnswers });
            await updateStatus(statusKey);
        }
    };

    const wrapper = { maxWidth: '520px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' };

    // 説明画面
    if (phase === 'instruction') {
        return (
            <div style={wrapper}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                    {timing === 'pre' ? '事前テスト' : '事後テスト'}
                </h2>
                <div style={{
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '8px',
                    lineHeight: '1.8',
                    fontSize: '16px',
                    color: '#333',
                }}>
                    <p style={{ marginBottom: '10px' }}>以下のSNS投稿を読んで、それぞれの質問に答えてください。</p>
                    <p style={{ marginBottom: '10px' }}>回答に正解・不正解はありません。</p>
                    <p>あなたが感じたままにお答えください。</p>
                </div>
                <StickyButton onClick={() => setPhase('test')} label="開始する" />
            </div>
        );
    }

    const post = questions[currentIdx];

    return (
        <div style={wrapper}>
            {/* 進捗 */}
            <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                    投稿 {currentIdx + 1} / {questions.length}
                </span>
            </div>

            {/* 投稿カード */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '4px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '16px',
            }}>
                <p style={{
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#222',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                }}>
                    {post.text}
                </p>
            </div>

            {/* Q1 */}
            <LikertScale
                id={`trust-${timing}-${currentIdx}`}
                label="Q1. この情報はどの程度信頼できると思いますか？"
                min={1}
                max={5}
                minLabel="信頼できない"
                maxLabel="信頼できる"
                centerLabel="どちらとも言えない"
                value={trustRating}
                onChange={setTrustRating}
            />

            {/* Q2 */}
            <div style={{ marginTop: '-8px' }}>
                <LikertScale
                    id={`share-${timing}-${currentIdx}`}
                    label="Q2. この投稿をSNSでシェアしますか？"
                    min={1}
                    max={5}
                    minLabel="絶対しない"
                    maxLabel="必ずする"
                    centerLabel="どちらとも言えない"
                    value={shareIntent}
                    onChange={setShareIntent}
                />
            </div>

            <StickyButton
                onClick={handleNext}
                disabled={!canProceed || loading}
                label={loading ? '保存中...' : isLast ? '完了' : '次の投稿へ'}
            />
        </div>
    );
}
