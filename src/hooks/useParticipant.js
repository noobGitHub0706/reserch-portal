import { useState, useCallback, useRef } from 'react';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const DEV_MODE = import.meta.env.DEV;
const devLog  = (...args) => { if (DEV_MODE) console.log('[DEV]', ...args); };
const devWarn = (...args) => { if (DEV_MODE) console.warn('[DEV]', ...args); };

export function useParticipant() {
    const [participant, setParticipant] = useState(null);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState(null);
    const firebaseOk = useRef(true);

    // Load existing participant from Firestore
    const load = useCallback(async (id) => {
        setLoading(true);
        try {
            devLog(`load: getDoc("${id}")`);
            const ref  = doc(db, 'participants', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() };
                devLog('load: 取得成功', data);
                setParticipant(data);
                return data;
            }
            // Not found
            devLog(`load: "${id}" は存在しない`);
            return null;
        } catch (e) {
            if (DEV_MODE) {
                firebaseOk.current = false;
                devWarn('load: Firebase失敗。インメモリで続行。', e);
                // Return a dev-mode default
                const defaults = {
                    id,
                    participantId: id,
                    condition: import.meta.env.VITE_DEV_CONDITION || 'experimental',
                    testSetOrder: import.meta.env.VITE_DEV_TEST_ORDER || 'AB',
                    status: 'consent',
                };
                setParticipant(defaults);
                return defaults;
            }
            setError('データの読み込みに失敗しました。接続を確認してください。');
            console.error(e);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new participant document
    const create = useCallback(async (id, condition, testSetOrder) => {
        const data = {
            participantId: id,
            condition,
            testSetOrder,
            status: 'consent',
            startedAt: serverTimestamp(),
        };

        if (!DEV_MODE || firebaseOk.current) {
            try {
                devLog(`create: setDoc("${id}")`);
                await setDoc(doc(db, 'participants', id), data);
                devLog('create: Firestore書き込み完了');
            } catch (e) {
                if (DEV_MODE) {
                    firebaseOk.current = false;
                    devWarn('create: Firestore失敗。インメモリのみ。', e);
                } else {
                    throw e;
                }
            }
        }

        const local = { id, ...data };
        setParticipant(local);
        return local;
    }, []);

    const updateStatus = useCallback(async (newStatus) => {
        setParticipant(prev => {
            if (!prev) return prev;
            const next = { ...prev, status: newStatus };

            if (!DEV_MODE || firebaseOk.current) {
                updateDoc(doc(db, 'participants', prev.id), { status: newStatus })
                    .then(() => devLog(`updateStatus: "${newStatus}" 完了`))
                    .catch(e => {
                        if (DEV_MODE) { firebaseOk.current = false; devWarn('updateStatus失敗', e); }
                        else console.error(e);
                    });
            } else {
                devLog(`updateStatus: Firebase スキップ → "${newStatus}"`);
            }

            return next;
        });
    }, []);

    const saveData = useCallback(async (field, data) => {
        setParticipant(prev => {
            if (!prev) return prev;

            if (!DEV_MODE || firebaseOk.current) {
                updateDoc(doc(db, 'participants', prev.id), {
                    [field]: { ...data, completedAt: serverTimestamp() },
                })
                    .then(() => devLog(`saveData: "${field}" 完了`))
                    .catch(e => {
                        if (DEV_MODE) { firebaseOk.current = false; devWarn(`saveData "${field}" 失敗`, e); }
                        else console.error(e);
                    });
            } else {
                devLog(`saveData: Firebase スキップ → "${field}"`);
            }

            return { ...prev, [field]: data };
        });
    }, []);

    // Update arbitrary root-level fields on the participant document
    const updateParticipant = useCallback(async (fields) => {
        setParticipant(prev => {
            if (!prev) return prev;

            if (!DEV_MODE || firebaseOk.current) {
                updateDoc(doc(db, 'participants', prev.id), fields)
                    .then(() => devLog('updateParticipant: 完了', fields))
                    .catch(e => {
                        if (DEV_MODE) { firebaseOk.current = false; devWarn('updateParticipant失敗', e); }
                        else console.error(e);
                    });
            } else {
                devLog('updateParticipant: Firebase スキップ', fields);
            }

            return { ...prev, ...fields };
        });
    }, []);

    const resetParticipant = useCallback(() => {
        setParticipant(null);
        setError(null);
        firebaseOk.current = true;
    }, []);

    return { participant, loading, error, load, create, updateStatus, updateParticipant, saveData, resetParticipant };
}
