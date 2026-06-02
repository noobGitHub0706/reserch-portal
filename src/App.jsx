import { useState, useEffect, useCallback } from 'react';
import { useParticipant } from './hooks/useParticipant';
import { assignCondition } from './lib/assignCondition';
import ProgressBar from './components/ProgressBar';
import ConsentPage from './pages/ConsentPage';
import DemographicsPage from './pages/DemographicsPage';
import TestPage from './pages/TestPage';
import GameRedirectPage from './pages/GameRedirectPage';
import PlaceboPage from './pages/PlaceboPage';
import SurveyPage from './pages/SurveyPage';
import CompletePage from './pages/CompletePage';

// URL params are fixed at load time for this SPA
const URL_PARAMS   = new URLSearchParams(window.location.search);
const URL_ID       = URL_PARAMS.get('id');    // set by game redirect
const PHASE_PARAM  = URL_PARAMS.get('phase'); // 'postTest' when returning from game

const TOTAL_STEPS = 7;

function getStep(status, condition, phaseParam) {
    // Returning from game or control group finishing placebo → post-test
    if (status === 'intervention' && (condition === 'control' || phaseParam === 'postTest')) {
        return 5;
    }
    return {
        consent:      2,
        demographics: 3,
        preTest:      4,
        intervention: 4,
        postTest:     6,
        survey:       7,
        complete:     7,
    }[status] ?? 1;
}

function statusLabel(status) {
    return {
        consent:      'デモグラフィクス回答中',
        demographics: '事前テスト回答中',
        preTest:      '課題実施中',
        intervention: '課題実施中',
        postTest:     '最終アンケート回答中',
        survey:       '完了',
        complete:     '完了',
    }[status] ?? '参加中';
}

function Layout({ children, step }) {
    const hasProgress = step !== undefined;
    return (
        <>
            {hasProgress && (
                <header style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    backgroundColor: '#fff', borderBottom: '1px solid #eee',
                    padding: '12px 20px', zIndex: 100,
                }}>
                    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                        <ProgressBar current={step} total={TOTAL_STEPS} />
                    </div>
                </header>
            )}
            <main style={{
                maxWidth: '640px', margin: '0 auto',
                padding: `${hasProgress ? '72px' : '40px'} 20px 100px`,
            }}>
                {children}
            </main>
        </>
    );
}

// ── Resume dialog ──────────────────────────────────────────────────────────
function ResumeDialog({ participant, onResume, onFresh }) {
    const isDone = participant.status === 'complete' || participant.status === 'survey';
    return (
        <Layout>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                {isDone ? '参加は完了しています' : '前回の続きから再開しますか？'}
            </h2>
            {!isDone && (
                <div style={{
                    backgroundColor: '#f7f7f7', padding: '16px 20px',
                    borderRadius: '8px', marginBottom: '24px',
                }}>
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
                        前回のステップ: <strong>{statusLabel(participant.status)}</strong>
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        参加者ID: {participant.id}
                    </p>
                </div>
            )}
            {isDone && (
                <p style={{ color: '#555', marginBottom: '24px', lineHeight: '1.7' }}>
                    ご参加いただきありがとうございました。新しいIDで最初からやり直すこともできます。
                </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!isDone && (
                    <button onClick={onResume} style={{
                        padding: '14px', backgroundColor: '#111', color: '#fff',
                        border: 'none', borderRadius: '6px', fontSize: '16px',
                        fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        続きから再開
                    </button>
                )}
                <button onClick={onFresh} style={{
                    padding: '14px', backgroundColor: '#fff', color: '#333',
                    border: '1.5px solid #ddd', borderRadius: '6px', fontSize: '15px',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    最初からやり直す（新しいIDで参加）
                </button>
            </div>
        </Layout>
    );
}

// ══════════════════════════════════════════════════════════════════════════
export default function App() {
    const [uiState, setUiState] = useState('checking');

    const {
        participant, loading, error,
        load, create, updateStatus, updateParticipant, saveData, resetParticipant,
    } = useParticipant();

    useEffect(() => {
        async function init() {
            if (URL_ID) {
                const data = await load(URL_ID);
                if (data) {
                    localStorage.setItem('participantId', URL_ID);
                    setUiState('active');
                } else {
                    setUiState('error');
                }
                return;
            }

            const storedId = localStorage.getItem('participantId');
            if (storedId) {
                const data = await load(storedId);
                if (data) {
                    setUiState('resume');
                } else {
                    localStorage.removeItem('participantId');
                    setUiState('consent');
                }
                return;
            }

            setUiState('consent');
        }
        init();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleConsentComplete = useCallback(async () => {
        const { id, condition, testSetOrder } = await assignCondition();
        localStorage.setItem('participantId', id);
        await create(id, condition, testSetOrder);
        setUiState('active');
    }, [create]);

    const handleResume = useCallback(() => setUiState('active'), []);
    const handleFresh  = useCallback(() => {
        localStorage.removeItem('participantId');
        resetParticipant();
        setUiState('consent');
    }, [resetParticipant]);

    if (uiState === 'checking' || loading) {
        return (
            <Layout>
                <p style={{ color: '#888' }}>読み込み中...</p>
            </Layout>
        );
    }

    if (uiState === 'error' || error) {
        return (
            <Layout>
                <h2 style={{ marginBottom: '12px' }}>エラー</h2>
                <p style={{ color: '#c00' }}>{error || 'データの取得に失敗しました。担当者にご連絡ください。'}</p>
            </Layout>
        );
    }

    if (uiState === 'consent') {
        return (
            <Layout>
                <ConsentPage onComplete={handleConsentComplete} />
            </Layout>
        );
    }

    if (uiState === 'resume' && participant) {
        return <ResumeDialog participant={participant} onResume={handleResume} onFresh={handleFresh} />;
    }

    if (!participant) {
        return (
            <Layout>
                <p style={{ color: '#888' }}>読み込み中...</p>
            </Layout>
        );
    }

    const { status, condition } = participant;
    const step = getStep(status, condition, PHASE_PARAM);

    const renderPage = () => {
        switch (status) {
            case 'consent':
                return (
                    <DemographicsPage
                        onComplete={async (data) => {
                            await saveData('demographics', data);
                            await updateStatus('demographics');
                        }}
                    />
                );

            case 'demographics':
                return (
                    <TestPage
                        timing="pre"
                        participant={participant}
                        saveData={saveData}
                        updateStatus={updateStatus}
                    />
                );

            case 'preTest':
                return condition === 'experimental'
                    ? (
                        <GameRedirectPage
                            participant={participant}
                            onUpdate={updateParticipant}
                        />
                    ) : (
                        <PlaceboPage
                            saveData={saveData}
                            updateStatus={updateStatus}
                        />
                    );

            case 'intervention':
                if (condition === 'control' || PHASE_PARAM === 'postTest') {
                    return (
                        <TestPage
                            timing="post"
                            participant={participant}
                            saveData={saveData}
                            updateStatus={updateStatus}
                        />
                    );
                }
                // Experimental: handles both pending (initial) and redirected (came back without postTest param)
                return (
                    <GameRedirectPage
                        participant={participant}
                        onUpdate={updateParticipant}
                    />
                );

            case 'postTest':
                return (
                    <SurveyPage
                        participant={participant}
                        saveData={saveData}
                        updateStatus={updateStatus}
                    />
                );

            case 'survey':
            case 'complete':
                return <CompletePage participant={participant} />;

            default:
                return (
                    <p style={{ color: '#888' }}>
                        不明なステータスです（{status}）。担当者にご連絡ください。
                    </p>
                );
        }
    };

    const isComplete = status === 'complete' || status === 'survey';

    return (
        <Layout step={isComplete ? undefined : step}>
            {renderPage()}
        </Layout>
    );
}
