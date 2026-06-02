# 研究ポータル 最終調整

以下の変更を全て実施してください。

## 1. フローの簡素化

媒介変数測定ページを削除し、フローを短縮します。

### ステータス遷移の変更

```
旧: consent → demographics → preMediator → preTest → intervention → postMediator → postTest → survey → complete
新: consent → demographics → preTest → intervention → postTest → survey → complete
```

### 具体的な変更

- App.jsx のステータス遷移から preMediator, postMediator を削除
- MediatorPage コンポーネントの呼び出しを削除（ファイル自体は残してよい）
- ゲームからの帰還時のphaseパラメータを postMediator → postTest に変更:
  `/?id=xxx&phase=postTest`
- ゲーム側のリダイレクトURLも postMediator → postTest に変更が必要
  （ゲーム側のフォールバックURLも修正）
- 進捗バーのステップ数を 9 → 7 に変更
- Firestore の participants ドキュメントから preMediator, postMediator フィールドの書き込みを削除

## 2. デモグラフィックの簡素化

DemographicsPage.jsx の質問を以下の3問のみに変更:

```
1. 年齢
   選択式（ラジオボタン）:
   ○ 18-22歳  ○ 23-29歳  ○ 30-39歳  ○ 40-49歳  ○ 50歳以上

2. SNSの利用頻度
   選択式:
   ○ 1日に複数回  ○ 毎日1回程度  ○ 週に数回  ○ 月に数回  ○ ほぼ使わない

3. 「自分はSNS上の情報の真偽を見抜く力がある」と思いますか？
   5段階:
   1(全くそう思わない) ─ 2 ─ 3 ─ 4 ─ 5(非常にそう思う)
```

全問回答で「次へ」ボタンが有効化。1画面で完結。
既存の他の質問項目（性別、利用SNS、健康情報入手先、ゲーム頻度等）は削除。

保存データ:
```javascript
// participants/{id}/demographics
{
    age: string,           // '18-22', '23-29', '30-39', '40-49', '50+'
    snsFrequency: string,  // 'multiple_daily', 'daily', 'weekly', 'monthly', 'rarely'
    infoLiteracySelf: number,  // 1-5
    completedAt: serverTimestamp(),
}
```

## 3. ID設計の変更

### IDフォーマット

条件が研究者にわかるように、連番の偶奇で区別:

```
偶数 = 実験群:  IC-0002-a3f7, IC-0004-k9m2, IC-0006-...
奇数 = 対照群:  IC-0001-b5h1, IC-0003-x2p6, IC-0005-...
```

### 実装

assignCondition 関数の修正:

```javascript
async function assignCondition(db) {
    const configRef = doc(db, 'config', 'randomization');
    
    return await runTransaction(db, async (transaction) => {
        const configDoc = await transaction.get(configRef);
        const data = configDoc.exists() ? configDoc.data() : {};
        let block = data.currentBlock || [];
        let nextNumber = data.nextNumber || 1;
        
        // ブロックが空なら新しいブロックを生成
        if (block.length === 0) {
            block = [
                { condition: 'experimental', testSetOrder: 'AB' },
                { condition: 'experimental', testSetOrder: 'BA' },
                { condition: 'control', testSetOrder: 'AB' },
                { condition: 'control', testSetOrder: 'BA' },
            ];
            // Fisher-Yatesシャッフル
            for (let i = block.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [block[i], block[j]] = [block[j], block[i]];
            }
        }
        
        // 先頭を取り出す
        const assignment = block.shift();
        
        // 条件に応じて偶数/奇数の番号を割り当て
        // nextNumberが偶数か奇数かを確認し、条件に合う番号に調整
        let assignedNumber;
        if (assignment.condition === 'experimental') {
            // 偶数にする
            assignedNumber = nextNumber % 2 === 0 ? nextNumber : nextNumber + 1;
        } else {
            // 奇数にする
            assignedNumber = nextNumber % 2 === 1 ? nextNumber : nextNumber + 1;
        }
        
        // 次の番号を更新（割り当てた番号 + 1）
        const newNextNumber = assignedNumber + 1;
        
        // IDを生成
        const randomSuffix = Math.random().toString(36).slice(2, 6);
        const id = `IC-${String(assignedNumber).padStart(4, '0')}-${randomSuffix}`;
        
        // 保存
        transaction.set(configRef, { 
            currentBlock: block, 
            nextNumber: newNextNumber,
        });
        
        return { id, ...assignment };
    });
}
```

### ConsentPage の修正

同意時に:
1. assignCondition() でID、condition、testSetOrderを取得
2. participants/{id} にドキュメントを作成
3. localStorageに id を保存
4. generateId() の旧ロジックは削除

## 4. 転移テストの全面差し替え

### テストセットのトピック変更

```
旧: セットA = サプリメント・代替医療、セットB = 食事・ダイエット
新: セットA = 育児・子育て、セットB = 美容・アンチエイジング
```

ゲーム内のトピックと重ならない領域に変更。

### 問題数の変更

```
旧: 操作的5問 + 正当3問 = 8問
新: 操作的5問 + 正当5問 = 10問
```

正当な投稿を増やすことで「正確な情報への信頼度が維持されたか」の検証力を上げる。

### Q2の変更

```
旧: Q2「この投稿の内容に基づいて行動しますか」(1-5)
新: Q2「この投稿をSNSでシェアしますか」(1-5)
```

尺度ラベル:
  1 = 絶対しない
  2 = たぶんしない
  3 = どちらとも言えない
  4 = たぶんする
  5 = 必ずする

### 転移テストデータの差し替え

src/data/testSets.js を以下に差し替え:

```javascript
export const TEST_SET_A = [
    // === 操作的投稿 5問（育児テーマ、5技法×1） ===
    {
        id: 'a1',
        text: 'ママ友から聞いたんだけど、市販の離乳食を使い続けてた子が3歳検診でアレルギー体質って言われたらしい。手作りに変えたら半年で完全に治ったって。やっぱり市販のは添加物が怖い。うちは絶対手作りにする。',
        techniques: ['testimonial'],
        isManipulative: true,
    },
    {
        id: 'a2',
        text: '国際発達教育研究所の大規模調査(n=8,500)で判明。3歳までに英語教育を始めた子どもは、始めなかった子と比較して言語IQが平均23ポイント高い。早期教育は科学的に正しい。',
        techniques: ['fabricated_evidence', 'authority'],
        isManipulative: true,
    },
    {
        id: 'a3',
        text: 'もうスマホ育児やってないママいないよね？\nうちの園のママ友全員タブレット学習させてる\nやらせてないの正直うちだけだった\nやっぱ遅れちゃダメだと思って始めた\n#タブレット学習 #知育',
        techniques: ['social_proof'],
        isManipulative: true,
    },
    {
        id: 'a4',
        text: '【警告】某大手ベビーフードメーカーの元開発担当者が内部告発。「自社基準の残留農薬検査は形骸化している。我が子には絶対に自社製品を食べさせない」。この事実を親なら知っておくべき。#拡散希望',
        techniques: ['fear', 'testimonial'],
        isManipulative: true,
    },
    {
        id: 'a5',
        text: 'ハーバード大学教育学部のトンプソン教授が断言。「日本の詰め込み教育は子どもの創造性を90%破壊する。フィンランド式教育に今すぐ切り替えるべき。」教育先進国では常識らしい。',
        techniques: ['authority', 'fear'],
        isManipulative: true,
    },

    // === 正当な投稿 5問 ===
    {
        id: 'a6',
        text: '厚生労働省は「授乳・離乳の支援ガイド」(2019年改定)において、離乳食の開始時期を生後5-6か月頃としています。ただし個人差があるため、子どもの発達に合わせて進めることが重要とされています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'a7',
        text: '日本小児科学会は、乳幼児のメディア利用について「一律に時間制限を設けるより、内容や使い方に注目すべき」との見解を示しています。親子で一緒に利用することを推奨しています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'a8',
        text: '国立成育医療研究センターの調査によると、日本の子どものアレルギー疾患の有症率は約30-40%で推移しています。原因は複合的であり、特定の食品や生活習慣だけで説明することは困難とのことです。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'a9',
        text: '文部科学省の全国学力調査(2024)の結果、学力テストの成績と家庭の社会経済的背景には相関が見られました。ただし学校の取り組みによって差を縮小できる事例も報告されています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'a10',
        text: 'WHO(世界保健機関)は、小児期の予防接種について「集団免疫の維持に不可欠」との立場を示しています。副反応のリスクはゼロではないが、接種による利益がリスクを大きく上回るとしています。',
        techniques: [],
        isManipulative: false,
    },
];

export const TEST_SET_B = [
    // === 操作的投稿 5問（美容テーマ、5技法×1） ===
    {
        id: 'b1',
        text: '幹細胞コスメに変えて2ヶ月。肌年齢が-15歳って測定された。\n友達にも「整形した？」って聞かれたレベル。\n高いけど美容皮膚科に通うよりコスパ良い。\n人生で最高の買い物かもしれない。\n#幹細胞コスメ #美肌',
        techniques: ['testimonial'],
        isManipulative: true,
    },
    {
        id: 'b2',
        text: 'スイス美容科学研究所の臨床試験(n=5,000, 二重盲検)で確認。コラーゲンペプチドの経口摂取により、12週間で肌の弾力が38%改善、シワの深さが27%減少。もう飲まない理由がない。',
        techniques: ['fabricated_evidence', 'authority'],
        isManipulative: true,
    },
    {
        id: 'b3',
        text: 'え、まだ毎日シャンプーしてる人いるの？？\n海外セレブはもうみんなノーシャンプーだよ\n皮脂の自浄作用知らないの？\nうちの美容院のお客さんも半分以上切り替えてる\n遅れてるよ日本。\n#ノーシャンプー #湯シャン',
        techniques: ['social_proof'],
        isManipulative: true,
    },
    {
        id: 'b4',
        text: '元大手化粧品メーカーの研究員です。匿名で告白します。日焼け止めに配合されている紫外線吸収剤は、長期使用で皮膚のバリア機能を不可逆的に破壊します。社内では周知の事実ですが消費者には伝えられていません。',
        techniques: ['fear', 'testimonial'],
        isManipulative: true,
    },
    {
        id: 'b5',
        text: 'MIT皮膚科学ラボのDr.チェンが発表。「腸内環境が肌質の87%を決定する。スキンケアは外側からのアプローチに過ぎず、本質的な改善には腸活が不可欠」。皮膚科医が教えない真実。',
        techniques: ['authority', 'fabricated_evidence'],
        isManipulative: true,
    },

    // === 正当な投稿 5問 ===
    {
        id: 'b6',
        text: '日本皮膚科学会は、シミの治療について「市販の美白化粧品で改善が期待できるのは軽度のものに限られる」としています。濃いシミや広範囲の色素沈着については皮膚科の受診を推奨しています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'b7',
        text: '消費者庁は、「飲むだけで痩せる」「塗るだけでシワが消える」等の広告表現について、合理的根拠がない場合は景品表示法違反にあたるとして、複数の事業者に措置命令を出しています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'b8',
        text: '厚生労働省の調査によると、20-30代女性の約7割が何らかのスキンケア製品を日常的に使用しています。ただし、製品の効果には個人差が大きく、自分の肌質に合った選択が重要とされています。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'b9',
        text: '国立健康・栄養研究所は、コラーゲンの経口摂取について「一部の研究で肌への効果を示唆する報告があるが、質の高いエビデンスは限定的」と評価しています。過度な期待は禁物とのことです。',
        techniques: [],
        isManipulative: false,
    },
    {
        id: 'b10',
        text: '環境省は、紫外線対策として日焼け止めの適切な使用を推奨しています。SPFやPA値は製品によって異なるため、活動内容に応じた選択が重要です。2-3時間ごとの塗り直しも推奨されています。',
        techniques: [],
        isManipulative: false,
    },
];
```

### TestPage.jsx の修正

- 問題数を8→10に対応（進捗表示「投稿 X / 10」）
- Q2のラベル変更: 「この投稿の内容に基づいて行動しますか」→「この投稿をSNSでシェアしますか」
- Q2の尺度ラベル: 1(絶対しない) - 3(どちらとも言えない) - 5(必ずする)
- 保存データのフィールド名変更: actionIntent → shareIntent

```javascript
// participants/{id}/preTest or postTest
{
    testSet: 'A' | 'B',
    answers: [
        {
            questionId: string,
            trustRating: number,    // 1-5 信頼度
            shareIntent: number,    // 1-5 シェア意図（旧actionIntent）
            responseTimeMs: number,
            displayOrder: number,
        }
    ],
    completedAt: serverTimestamp(),
}
```

## 5. アンケートの修正

### 実験群アンケートに1項目追加

既存の項目に加えて:

```
「ゲーム中の投稿は、実際のSNSで見かける投稿に近いと感じましたか」
  1(全く感じない) ─ 3(どちらとも言えない) ─ 5(非常に感じる)
```

フィールド名: ecologicalValidity

### 対照群アンケートは変更なし

## 6. ゲーム側のリダイレクト修正

infodemic-survivor のリダイレクト先を変更:

```
旧: /?id=${participantId}&phase=postMediator
新: /?id=${participantId}&phase=postTest
```

GameEngine.jsx またはResultScreen.jsx のリダイレクトURLを修正。
フォールバックURLも同様に修正:

```javascript
const portalUrl = import.meta.env.VITE_RESEARCH_PORTAL_URL || 'https://noobgithub0706.github.io/reserch-portal/';
window.location.href = `${portalUrl}?id=${participantId}&phase=postTest`;
```

## 7. 動作確認

1. フロー: consent → demographics(3問) → preTest(10問) → intervention → postTest(10問) → survey → complete
2. 媒介変数ページが表示されないこと
3. デモグラフィックが3問のみであること
4. 転移テストが10問であること（操作的5 + 正当5）
5. テストセットA = 育児テーマ、セットB = 美容テーマであること
6. Q2が「この投稿をSNSでシェアしますか」になっていること
7. IDが偶数=実験群、奇数=対照群のフォーマットであること
8. 4人連続アクセスで4パターンが出現すること
9. 実験群: ゲームへリダイレクト → ゲーム完了 → postTestに戻ること
10. 対照群: プラセボ課題 → postTest に進むこと
11. アンケートに ecologicalValidity 項目があること（実験群のみ）
12. Firebaseにデータが正しく保存されること
