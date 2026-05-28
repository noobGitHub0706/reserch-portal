# 研究ポータル 完成プロンプト

以下の未実装機能を全て実装してください。

## 1. 自動ID発行 + ブロックランダム化

### 1-1. 自動ID発行

URLパラメータの ?id= は不要。同意ボタンを押した時点でIDを自動生成。

```javascript
const generateId = () => `IC-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
```

生成したIDはlocalStorageにも保存:
```javascript
localStorage.setItem('participantId', id);
```

再アクセス時にlocalStorageを確認し、既存IDがあればFirestoreからstatusを取得して再開:
```
「前回の続きから再開しますか？」
[続きから再開] [最初からやり直す]
```
「最初からやり直す」は新しいIDを生成。

### 1-2. ブロックランダム化

4人を1ブロックとし、各ブロック内で以下の4パターンが1回ずつ出現:
  (experimental, AB), (experimental, BA), (control, AB), (control, BA)

Firestoreに割り当てカウンターを持つ:

```javascript
// コレクション: config, ドキュメント: randomization
{
    currentBlock: [],  // シャッフル済みの残り割り当てリスト
}
```

同意時の処理:
```javascript
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';

async function assignCondition(db) {
    const configRef = doc(db, 'config', 'randomization');
    
    return await runTransaction(db, async (transaction) => {
        const configDoc = await transaction.get(configRef);
        let block = configDoc.exists() ? configDoc.data().currentBlock : [];
        
        // ブロックが空なら新しいブロックを生成
        if (!block || block.length === 0) {
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
        
        // 残りを保存
        transaction.set(configRef, { currentBlock: block });
        
        return assignment;
    });
}
```

## 2. 参加者データの保存構造

```javascript
// participants/{id}
{
    participantId: id,
    condition: 'experimental' | 'control',
    testSetOrder: 'AB' | 'BA',
    status: 'consent',
    startedAt: serverTimestamp(),
}
```

statusの遷移:
```
consent → demographics → preMediator → preTest → intervention → postMediator → postTest → survey → complete
```

各ステップ完了時に status を更新し、データを保存。

## 3. 媒介変数測定ページ（MediatorPage.jsx）

事前・事後で同じ画面。7項目、7段階リカート。

```
以下の各文について、どの程度あてはまるか答えてください。
（1 = 全くあてはまらない ～ 7 = 非常にあてはまる）

【説得知識】
1. SNSの投稿には、読者を操作するための特定の戦略が使われていることがある
2. 操作的な投稿がどのような手法で作られているか理解している
3. 操作的な情報に使われる具体的な技法の名前を挙げることができる

【脅威の認識】
4. 自分がSNS上の操作的情報に影響されうるという危機感がある
5. 操作的な情報に対して、自分の判断を守りたいと感じる

【反論の自信】
6. 操作的な投稿を見抜く自信がある
7. なぜその投稿が操作的なのか、他人に説明できる
```

リカート尺度のUI:
- 7つのボタンを横並び、各44px以上
- 選択済みは背景 #374151 + 白テキスト
- 両端にラベル（左「全くあてはまらない」、右「非常にあてはまる」）
- 見出し（説得知識等）は参加者には見せない。カテゴリ分けは内部データとしてのみ保持

保存先:
```javascript
// participants/{id}/preMediator or postMediator
{
    pk_1: number, pk_2: number, pk_3: number,
    mt_1: number, mt_2: number,
    cse_1: number, cse_2: number,
    completedAt: serverTimestamp(),
}
```

props で timing ('pre' | 'post') を受け取り、保存先を切り替える。

## 4. テスト画面（TestPage.jsx）

### 4-1. 投稿表示
- 投稿本文のみ表示（アカウント名、いいね数、RT数は表示しない）
- カード: 白背景、角丸4px、box-shadow: 0 1px 3px rgba(0,0,0,0.1)、padding 24px

### 4-2. 各投稿に2つの質問

Q1:「この情報はどの程度信頼できると思いますか？」
  5段階: 1(信頼できない) - 3(どちらとも言えない) - 5(信頼できる)

Q2:「この投稿の内容に基づいて行動しますか？」
  5段階: 1(全くしない) - 3(どちらとも言えない) - 5(必ずする)

### 4-3. 尺度UI
- 5つの円形ボタン横並び、各44px以上
- 選択済み: 背景 #374151 + 白テキスト
- 未選択: 白背景 + グレーボーダー
- 両端にラベル表示

### 4-4. 提示フロー
- 1問ずつ表示（1画面に1投稿 + 2質問）
- Q1, Q2 両方回答で「次の投稿へ」ボタンが有効化
- 戻れない
- 進捗表示「投稿 3 / 8」

### 4-5. 表示順のランダム化
- 参加者ごとに8問の表示順をシャッフル（Fisher-Yates）
- 事前と事後で異なるシャッフル

### 4-6. 時間計測
- 各投稿の表示開始時刻をDate.now()で記録
- 回答完了時との差分をresponseTimeMsとして保存

### 4-7. テストセットの切り替え
- participant.testSetOrder と timing から使用セットを決定:
  AB + pre → セットA, AB + post → セットB
  BA + pre → セットB, BA + post → セットA

### 4-8. 保存データ
```javascript
// participants/{id}/preTest or postTest
{
    testSet: 'A' | 'B',
    answers: [
        { questionId, trustRating (1-5), actionIntent (1-5), responseTimeMs, displayOrder }
    ],
    completedAt: serverTimestamp(),
}
```

### 4-9. テストデータ

テストデータ（testSets.js）がまだ仮データの場合は、以下の構造で各セット8問を用意:

セットA（サプリメント・代替医療テーマ）:
- 操作的投稿 5問（5技法それぞれ1問）
- 正当な投稿 3問
セットB（食事・ダイエットテーマ）:
- 操作的投稿 5問（5技法それぞれ1問）
- 正当な投稿 3問

各投稿の構造:
```javascript
{
    id: 'a1',
    text: '投稿本文',
    techniques: ['fear'],  // 正解（分析用、参加者には見せない）
    isManipulative: true,
}
```

テスト投稿もSNSネイティブな文体で。ただしゲーム（スマホ・デジタル健康テーマ）とは異なるトピックにすること（転移を検証するため）。

## 5. ゲームへのリダイレクト（実験群のみ）

GameRedirectPage.jsx:

```
テストが完了しました。

次のステップとして、Web上の課題に取り組んでいただきます。
下のボタンを押すと、別のサイトに移動します。
課題が完了したら、自動的にこのページに戻ります。

[課題を開始する]
```

ボタンクリック時:
```javascript
const gameUrl = import.meta.env.VITE_GAME_URL || 'http://localhost:5173';
window.location.href = `${gameUrl}/?id=${participantId}`;
```

.env に追加:
  VITE_GAME_URL=http://localhost:5173（開発時）

### ゲームからの帰還

ゲーム完了時に研究ポータルにリダイレクトされてくる:
  URL: /?id=IC-xxx&phase=postMediator

App.jsx で phase パラメータを確認し、該当ステップから再開。

## 6. プラセボ課題（対照群のみ）

PlaceboPage.jsx:

健康・SNS・レトリックに無関係な読解課題を表示。
2本の読解文 + 各文に理解度確認問題3問。

### 読解文1: 印刷技術の発展

```
グーテンベルクと活版印刷の革命

1440年頃、ドイツのヨハネス・グーテンベルクは活版印刷技術を実用化しました。
それ以前の書物は手書きで写本されており、1冊の本を作るのに数ヶ月から数年を要していました。

グーテンベルクの革新は、個々の文字を金属の活字として鋳造し、
それを組み合わせてページを構成するという方法でした。
これにより、同じページを何度でも印刷でき、書物の大量生産が初めて可能になりました。

最初に印刷された大規模な書物は「グーテンベルク聖書」として知られる42行聖書で、
約180部が印刷されたとされています。現存するのは約49部です。

活版印刷の普及は社会に大きな変化をもたらしました。
情報の伝達速度が飛躍的に向上し、識字率の上昇、宗教改革の拡大、
科学革命の促進など、近代社会の形成に深く関わりました。

15世紀末までにヨーロッパ各地に印刷所が設立され、
推定2,000万部以上の書物が印刷されたと考えられています。
```

確認問題:
1. グーテンベルクが活版印刷を実用化したのはいつ頃ですか？
   [A] 1240年頃 [B] 1440年頃 [C] 1640年頃 [D] 1840年頃
   正解: B

2. グーテンベルク聖書は約何部印刷されましたか？
   [A] 約18部 [B] 約49部 [C] 約180部 [D] 約1800部
   正解: C

3. 活版印刷の特徴として正しいものはどれですか？
   [A] 木版に文字を彫る [B] 金属の活字を組み合わせる [C] 手書きで複製する [D] 写真製版を用いる
   正解: B

### 読解文2: 鉄道の発展

```
蒸気機関車と鉄道の誕生

1804年、イギリスのリチャード・トレビシックが世界初の蒸気機関車を製作しました。
しかし、当時の線路は機関車の重量に耐えられず、実用化には至りませんでした。

1825年、ジョージ・スティーブンソンが設計したストックトン・ダーリントン鉄道が
世界初の公共鉄道として開業しました。蒸気機関車「ロコモーション号」が
石炭と乗客を運びました。

1830年に開業したリバプール・マンチェスター鉄道は、
都市間を結ぶ本格的な旅客鉄道の始まりとされています。
スティーブンソンの「ロケット号」は時速約47kmを記録し、当時としては驚異的な速度でした。

鉄道の普及は産業革命を加速させ、人々の移動距離と速度を劇的に変えました。
また、鉄道の運行管理の必要性から、標準時の概念が生まれ、
1884年の国際子午線会議でグリニッジ標準時が採用される契機となりました。

日本では1872年（明治5年）に新橋―横浜間で初の鉄道が開業しました。
```

確認問題:
1. 世界初の蒸気機関車を製作したのは誰ですか？
   [A] ジェームズ・ワット [B] ジョージ・スティーブンソン [C] リチャード・トレビシック [D] トーマス・エジソン
   正解: C

2. リバプール・マンチェスター鉄道が開業したのは何年ですか？
   [A] 1804年 [B] 1825年 [C] 1830年 [D] 1872年
   正解: C

3. 鉄道の普及がきっかけとなって生まれた概念は何ですか？
   [A] 通貨統一 [B] 標準時 [C] 義務教育 [D] 特許制度
   正解: B

### UIの実装

- 1本目の読解文を表示 → [読み終わったら次へ] ボタン
- 確認問題3問を1問ずつ表示（4択ラジオボタン）
- 全問回答で次へ
- 2本目も同様
- 読解時間を記録（各文の表示開始から次へボタンまで）

保存データ:
```javascript
// participants/{id}/intervention
{
    type: 'placebo',
    readings: [
        { id: 'printing', readingTimeMs: number },
        { id: 'railway', readingTimeMs: number },
    ],
    comprehensionAnswers: [
        { questionId, selectedAnswer, correct: boolean },
    ],
    totalDurationMs: number,
    completedAt: serverTimestamp(),
}
```

## 7. アンケート画面（SurveyPage.jsx）

participant.condition で実験群版/対照群版を切り替え。

### 実験群版

```
課題はどの程度楽しかったですか？
  1(全く楽しくない) ─ 5(非常に楽しい)

課題への没入感はどの程度でしたか？
  1(全く没入しなかった) ─ 5(非常に没入した)

課題の難易度はどの程度でしたか？
  1(非常に簡単) ─ 5(非常に難しい)

課題を通じて学びがあったと感じますか？
  1(全く感じない) ─ 5(非常に感じる)

この課題を他の人にも勧めたいと思いますか？
  1(全く勧めない) ─ 5(強く勧めたい)

自由記述（任意）:
  [テキストエリア]
```

### 対照群版

```
読解課題の難易度はどの程度でしたか？
  1(非常に簡単) ─ 5(非常に難しい)

読解課題を通じて学びがあったと感じますか？
  1(全く感じない) ─ 5(非常に感じる)

自由記述（任意）:
  [テキストエリア]
```

保存先: participants/{id}/survey

## 8. 完了画面（CompletePage.jsx）

```
ご参加いただきありがとうございました。

あなたの回答は正常に記録されました。
このページを閉じていただいて構いません。
```

## 9. 全体のフロー制御（App.jsx）

```javascript
// statusに基づいて現在のページを決定
function getCurrentPage(status, condition) {
    switch (status) {
        case 'consent': return <ConsentPage />;
        case 'demographics': return <DemographicsPage />;
        case 'preMediator': return <MediatorPage timing="pre" />;
        case 'preTest': return <TestPage timing="pre" />;
        case 'intervention':
            return condition === 'experimental' 
                ? <GameRedirectPage /> 
                : <PlaceboPage />;
        case 'postMediator': return <MediatorPage timing="post" />;
        case 'postTest': return <TestPage timing="post" />;
        case 'survey': return <SurveyPage />;
        case 'complete': return <CompletePage />;
    }
}
```

ゲームから戻ってきた場合（URLに phase=postMediator がある場合）:
- statusを 'postMediator' に更新
- MediatorPage(post) を表示

## 10. デザイン

- 白背景、黒テキスト、最小限の装飾
- max-width: 640px、中央寄せ
- フォント: system-ui, sans-serif
- 本文16px、見出し20px
- ゲームの色彩やフォントは一切使わない
- 進捗バー: ページ上部に表示（ステップ X / 9）

## 11. 動作確認

1. アクセス → 同意 → IDが自動生成される
2. Firebaseにparticipantsドキュメントが作成される
3. condition/testSetOrderがブロックランダム化で割り当てられる
4. 4人連続でアクセスすると4パターンが1回ずつ出現する
5. demographics → preMediator → preTest が順に進む
6. 実験群: GameRedirectPage → ゲームURLにリダイレクト
7. 対照群: PlaceboPage → 読解文+確認問題
8. postMediator → postTest → survey → complete
9. 完了画面でstatusが'complete'になる
10. ブラウザを閉じて再アクセス → 「続きから再開しますか？」
