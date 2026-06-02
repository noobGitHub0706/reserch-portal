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

// 偶数 = 実験群 (IC-0002-xxxx), 奇数 = 対照群 (IC-0001-xxxx)
export async function assignCondition() {
    const configRef = doc(db, 'config', 'randomization');
    try {
        return await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(configRef);
            const data = snap.exists() ? snap.data() : {};
            let block = data.currentBlock ?? [];
            let nextNumber = data.nextNumber ?? 1;

            if (!block.length) {
                block = fisherYates([...CONDITIONS]);
            }

            const assignment = block[0];

            let assignedNumber;
            if (assignment.condition === 'experimental') {
                assignedNumber = nextNumber % 2 === 0 ? nextNumber : nextNumber + 1;
            } else {
                assignedNumber = nextNumber % 2 === 1 ? nextNumber : nextNumber + 1;
            }

            const randomSuffix = Math.random().toString(36).slice(2, 6);
            const id = `IC-${String(assignedNumber).padStart(4, '0')}-${randomSuffix}`;

            transaction.set(configRef, {
                currentBlock: block.slice(1),
                nextNumber: assignedNumber + 1,
            });

            return { id, ...assignment };
        });
    } catch (e) {
        console.warn('[assignCondition] Firestore transaction failed, using random assignment:', e);
        const assignment = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        const base = Math.floor(Math.random() * 4998) + 1;
        const num = assignment.condition === 'experimental'
            ? (base % 2 === 0 ? base : base + 1)
            : (base % 2 === 1 ? base : base + 1);
        const randomSuffix = Math.random().toString(36).slice(2, 6);
        const id = `IC-${String(num).padStart(4, '0')}-${randomSuffix}`;
        return { id, ...assignment };
    }
}
