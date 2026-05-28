import { useState, useRef } from 'react';
import { PLACEBO_TEXTS } from '../data/placeboTexts';
import StickyButton from '../components/StickyButton';

export default function PlaceboPage({ saveData, updateStatus }) {
    const [textIdx, setTextIdx]         = useState(0);
    const [phase, setPhase]             = useState('reading'); // 'reading' | 'questions'
    const [questionIdx, setQuestionIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const [readings, setReadings]                 = useState([]);
    const [comprehensionAnswers, setComprehensionAnswers] = useState([]);
    const [loading, setLoading]                   = useState(false);

    const readingStartRef = useRef(Date.now());
    const totalStartRef   = useRef(Date.now());

    const currentText = PLACEBO_TEXTS[textIdx];

    const handleFinishReading = () => {
        const readingTimeMs = Date.now() - readingStartRef.current;
        setReadings(prev => [...prev, { id: currentText.id, readingTimeMs }]);
        setPhase('questions');
        setQuestionIdx(0);
        setSelectedAnswer(null);
    };

    const handleAnswerNext = async () => {
        if (selectedAnswer === null || loading) return;

        const currentQ = currentText.questions[questionIdx];
        const newAnswer = {
            questionId: currentQ.id,
            selectedAnswer,
            correct: selectedAnswer === currentQ.correctIndex,
        };
        const newAnswers = [...comprehensionAnswers, newAnswer];

        const isLastQuestion = questionIdx === currentText.questions.length - 1;
        const isLastText     = textIdx === PLACEBO_TEXTS.length - 1;

        if (!isLastQuestion) {
            setComprehensionAnswers(newAnswers);
            setQuestionIdx(prev => prev + 1);
            setSelectedAnswer(null);
        } else if (!isLastText) {
            setComprehensionAnswers(newAnswers);
            setTextIdx(prev => prev + 1);
            setPhase('reading');
            setQuestionIdx(0);
            setSelectedAnswer(null);
            readingStartRef.current = Date.now();
        } else {
            setLoading(true);
            const allReadings = [...readings]; // already includes current text's reading
            await saveData('intervention', {
                type: 'placebo',
                readings: allReadings,
                comprehensionAnswers: newAnswers,
                totalDurationMs: Date.now() - totalStartRef.current,
            });
            // Both experimental and control continue to postMediator page via 'intervention' status
            await updateStatus('intervention');
        }
    };

    if (phase === 'reading') {
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>読解課題</h2>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                        文章 {textIdx + 1} / {PLACEBO_TEXTS.length}
                    </span>
                </div>
                <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
                    以下の文章をよく読んでください。読み終わったら「次へ」を押してください。
                </p>

                <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: '24px 28px',
                    backgroundColor: '#fefefe',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '18px', color: '#222' }}>
                        {currentText.title}
                    </h3>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.9', fontSize: '15px', color: '#333' }}>
                        {currentText.content}
                    </div>
                </div>

                <StickyButton onClick={handleFinishReading} label="次へ（理解度確認）" />
            </div>
        );
    }

    const currentQ      = currentText.questions[questionIdx];
    const isLastQuestion = questionIdx === currentText.questions.length - 1;
    const isLastText     = textIdx === PLACEBO_TEXTS.length - 1;
    const isVeryLast     = isLastQuestion && isLastText;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600' }}>理解度確認</h2>
                <span style={{ fontSize: '13px', color: '#999' }}>
                    問題 {questionIdx + 1} / {currentText.questions.length}
                </span>
            </div>
            <p style={{ color: '#888', marginBottom: '20px', fontSize: '14px' }}>
                先ほど読んだ文章に関する質問です。
            </p>

            <div style={{ backgroundColor: '#f7f7f7', padding: '20px 24px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#222' }}>
                    {currentQ.text}
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQ.options.map((opt, i) => (
                    <label
                        key={i}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 18px',
                            border: `1.5px solid ${selectedAnswer === i ? '#333' : '#ddd'}`,
                            borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: selectedAnswer === i ? '#f0f0f0' : '#fff',
                            transition: 'background-color 0.1s, border-color 0.1s',
                        }}
                    >
                        <input
                            type="radio"
                            name={`placebo-q-${textIdx}-${questionIdx}`}
                            checked={selectedAnswer === i}
                            onChange={() => setSelectedAnswer(i)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '15px', lineHeight: '1.5' }}>{opt}</span>
                    </label>
                ))}
            </div>

            <StickyButton
                onClick={handleAnswerNext}
                disabled={selectedAnswer === null || loading}
                label={loading ? '保存中...' : isVeryLast ? '完了' : '次へ'}
            />
        </div>
    );
}
