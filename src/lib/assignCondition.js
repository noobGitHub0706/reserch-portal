import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

const CONDITIONS = [
    { condition: 'experimental', testSetOrder: 'AB' },
    { condition: 'experimental', testSetOrder: 'BA' },
    { condition: 'control',      testSetOrder: 'AB' },
    { condition: 'control',      testSetOrder: 'BA' },
];

function fisherYates(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export async function assignCondition() {
    const configRef = doc(db, 'config', 'randomization');
    try {
        return await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(configRef);
            let block = snap.exists() ? (snap.data().currentBlock ?? []) : [];

            if (!block.length) {
                block = fisherYates([...CONDITIONS]);
            }

            const assignment = block[0];
            transaction.set(configRef, { currentBlock: block.slice(1) });
            return assignment;
        });
    } catch (e) {
        console.warn('[assignCondition] Firestore transaction failed, using random assignment:', e);
        return CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    }
}
