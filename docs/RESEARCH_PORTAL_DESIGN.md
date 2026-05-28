# 研究ポータル 設計書

## 1. 概要

参加者の実験フローを一元管理するWebアプリケーション。
事前テスト、プラセボ課題、事後テスト、アンケートを全てこのサイト内で実施する。
ゲーム（Infodemic Chronicle）のみ別サイトに分離。

```
research.example.com  — 研究ポータル（本設計書）
game.example.com      — Infodemic Chronicle（既存）
```

## 2. 技術スタック

- React（Vite）
- Firebase Firestore（データ保存、ゲーム側と同じプロジェクト）
- デザイン: シンプル・無機質（ゲームの世界観を持ち込まない）
- ホスティング: GitHub Pages or Firebase Hosting

## 3. 参加者フロー

### 3-1. 実験群フロー

```
[URLアクセス] research.example.com/?id=IC-037
    ↓
[1. 同意画面]
    ↓
[2. デモグラフィック]
    ↓
[3. 事前 媒介変数測定]
    ↓
[4. 事前テスト]
    ↓
[5. ゲームへの誘導]
    「次のステップに進んでください」ボタン
    → game.example.com/?id=IC-037 にリダイレクト
    ↓
    （ゲームプレイ）
    ↓
    ゲーム完了時に自動リダイレクト
    → research.example.com/?id=IC-037&phase=postMediator
    ↓
[6. 事後 媒介変数測定]
    ↓
[7. 事後テスト]
    ↓
[8. アンケート]
    ↓
[9. 完了画面]
```

### 3-2. 対照群フロー

```
[URLアクセス] research.example.com/?id=IC-042
    ↓
[1. 同意画面]
    ↓
[2. デモグラフィック]
    ↓
[3. 事前 媒介変数測定]
    ↓
[4. 事前テスト]
    ↓
[5. プラセボ課題]
    ↓
[6. 事後 媒介変数測定]
    ↓
[7. 事後テスト]
    ↓
[8. アンケート（対照群版）]
    ↓
[9. 完了画面]
```

## 4. 画面設計

### 共通レイアウト

```
┌─────────────────────────────────────┐
│         研究へのご参加               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     （各画面のコンテンツ）     │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ──────────── ● ○ ○ ○ ○ ○ ──────   │
│  ステップ 1 / 9                      │
│                                     │
└─────────────────────────────────────┘
```

- 白背景、黒テキスト、最小限の装飾
- 進捗バー（現在のステップ / 全ステップ）
- ゲームのキャラクター、色彩、ナラティブ要素は一切含めない

### 4-1. 同意画面

```
研究へのご協力のお願い

本研究は、SNS上の健康情報に関する判断力について調査するものです。

【研究概要】
- 所要時間: 約40-50分（テスト約15分 + 課題約20-30分）
- 内容: アンケート、情報判断テスト、Web上の課題
- データの取り扱い: 匿名化して統計的に処理
- 参加は任意であり、いつでも中断できます

【同意事項】
☐ 上記の内容を理解し、研究に参加することに同意します

                        [同意して開始]
```

注意: 実験群・対照群どちらかは明示しない。
「Web上の課題」という曖昧な表現で両群をカバー。

### 4-2. デモグラフィック

```
あなたについて教えてください

年齢:
  ○ 18-22  ○ 23-29  ○ 30-39  ○ 40-49  ○ 50以上

性別:
  ○ 男性  ○ 女性  ○ その他  ○ 回答しない

SNSの利用頻度:
  ○ 1日に複数回  ○ 毎日1回程度  ○ 週に数回  ○ 月に数回  ○ ほぼ使わない

利用しているSNS（複数選択可）:
  ☐ X (Twitter)  ☐ Instagram  ☐ TikTok  ☐ Facebook  ☐ LINE  ☐ YouTube  ☐ その他

健康情報の主な入手先（複数選択可）:
  ☐ SNS  ☐ ニュースサイト  ☐ 医師・専門家  ☐ 家族・友人  ☐ 検索エンジン  ☐ その他

「自分はSNS上の情報の真偽を見抜く力がある」と思いますか？:
  ○ 1 全くそう思わない ... ○ 5 非常にそう思う

普段ゲームをプレイする頻度:
  ○ 1 全くしない ... ○ 5 毎日する

                        [次へ]
```

### 4-3. 媒介変数測定（事前・事後共通）

```
以下の各文について、どの程度あてはまるか答えてください。
（1 = 全くあてはまらない ～ 7 = 非常にあてはまる）

【脅威感】
1. 自分はSNS上の操作的な情報に影響されうると思う
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

2. 健康に関する誤情報は自分の判断に影響する可能性がある
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

【反論動機】
3. 操作的な投稿を見かけたら、反論を考えようとする
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

4. 健康情報を見たとき、使われている説得技法を意識する
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

【反論効力感】
5. 操作的な投稿を見抜く自信がある
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

6. なぜその投稿が操作的なのか、他人に説明できる
   1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

                        [次へ]
```

### 4-4. 事前テスト / 事後テスト

```
以下のSNS投稿を読んで、質問に答えてください。
（問題 1 / 8）

┌─────────────────────────────────────┐
│ 💊 ナチュラルヘルスケア研究会         │
│ @natural_health_lab                  │
│                                      │
│ 当研究会の調査によると、特定のハーブ  │
│ エキスの摂取により免疫力が平均32%     │
│ 向上することが確認されました。        │
│                                      │
│ ❤️ 2,345  🔄 891  💬 234             │
└─────────────────────────────────────┘

Q1. この投稿はどの程度操作的だと思いますか？
    1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7
    全く操作的でない          非常に操作的

Q2. この投稿の内容に基づいて行動しますか？
    1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7
    全くしない              必ずする

                        [次の投稿へ]
```

- 1問ずつ表示（回答後に次へ進む、戻れない）
- 各問の表示時刻と回答時刻からresponseTimeMsを自動計算
- テストセットA/BのカウンターバランスはIDに紐づけて事前決定

### 4-5. ゲームへの誘導（実験群のみ）

```
テストが完了しました。

次のステップとして、Web上の課題に取り組んでいただきます。
下のボタンを押すと、別のサイトに移動します。

課題が完了したら、自動的にこのページに戻ります。

              [課題を開始する]
```

「ゲーム」という言葉は使わない。「Web上の課題」とする。

### 4-6. プラセボ課題（対照群のみ）

```
以下の文章を読んでください。

【情報技術の発展と日常生活】

（一般的な読解文を表示。健康情報やSNSとは無関係なトピック。）

...

読み終わったら「次へ」を押してください。

                        [次へ]

（読後の理解度確認問題を3-4問出題）
```

プラセボ課題の要件:
- 健康情報・SNS・レトリックに無関係なトピック
- ゲームと同程度の所要時間（20-30分）→ 複数の文章で構成
- 理解度確認で「ちゃんと読んだ」ことを担保

### 4-7. アンケート（実験群版）

```
最後にいくつか質問にお答えください。

課題はどの程度楽しかったですか？
  1 ─ 2 ─ 3 ─ 4 ─ 5
  全く楽しくない      非常に楽しい

課題への没入感はどの程度でしたか？
  1 ─ 2 ─ 3 ─ 4 ─ 5
  全く没入しなかった    非常に没入した

課題の難易度はどの程度でしたか？
  1 ─ 2 ─ 3 ─ 4 ─ 5
  非常に簡単           非常に難しい

課題を通じて学びがあったと感じますか？
  1 ─ 2 ─ 3 ─ 4 ─ 5
  全く感じない         非常に感じる

この課題を他の人にも勧めたいと思いますか？
  1 ─ 2 ─ 3 ─ 4 ─ 5
  全く勧めない         強く勧めたい

第1章の内容は、操作的だと見抜きやすかったですか？
  1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

第2章の内容は、操作的だと見抜きやすかったですか？
  1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

第3章の内容は、操作的だと見抜きやすかったですか？
  1 ─ 2 ─ 3 ─ 4 ─ 5 ─ 6 ─ 7

最も見破りにくかった技法はどれですか？
  ○ 恐怖訴求  ○ 権威訴求  ○ 根拠の捏造・歪曲  ○ 証言利用  ○ 社会的証明  ○ 特になし

最も学びになった活動はどれですか？
  ○ 技法識別  ○ 発信体験  ○ 情報検証  ○ ボス戦  ○ 特になし

自由記述（任意）:
  ┌─────────────────────────────┐
  │                              │
  └─────────────────────────────┘

                        [送信]
```

### 4-8. アンケート（対照群版）

```
最後にいくつか質問にお答えください。

読解課題の難易度はどの程度でしたか？
  1 ─ 2 ─ 3 ─ 4 ─ 5

読解課題を通じて学びがあったと感じますか？
  1 ─ 2 ─ 3 ─ 4 ─ 5

自由記述（任意）:
  ┌─────────────────────────────┐
  │                              │
  └─────────────────────────────┘

                        [送信]
```

### 4-9. 完了画面

```
ご参加いただきありがとうございました。

あなたの回答は正常に記録されました。
このページを閉じていただいて構いません。

参加者ID: IC-037
```

## 5. Firestore スキーマ

```
participants/{id}
├── condition: 'experimental' | 'control'
├── testSetOrder: 'AB' | 'BA'
├── status: 'assigned' | 'consent' | 'demographics' | 'preMediator' 
│           | 'preTest' | 'intervention' | 'postMediator' 
│           | 'postTest' | 'survey' | 'complete'
├── startedAt: timestamp
├── completedAt: timestamp
│
├── demographics: {
│       age, gender, snsUsage, snsPlatforms,
│       healthInfoSource, infoLiteracySelf, gameExperience
│   }
│
├── preMediator: {
│       threat_1, threat_2,
│       motivation_1, motivation_2,
│       efficacy_1, efficacy_2,
│       completedAt
│   }
│
├── preTest: {
│       testSet: 'A' | 'B',
│       answers: [{ questionId, rating, actionIntent, responseTimeMs }],
│       completedAt
│   }
│
├── intervention: {
│       type: 'game' | 'placebo',
│       startedAt,
│       completedAt,
│       // 対照群のみ:
│       placeboAnswers: [{ questionId, answer, correct }],
│       // 実験群のゲームデータはゲーム側のFirebaseに保存
│   }
│
├── postMediator: {
│       threat_1, threat_2,
│       motivation_1, motivation_2,
│       efficacy_1, efficacy_2,
│       completedAt
│   }
│
├── postTest: {
│       testSet: 'A' | 'B',
│       answers: [{ questionId, rating, actionIntent, responseTimeMs }],
│       completedAt
│   }
│
└── survey: {
        // 実験群
        enjoyment, immersion, difficulty, learning, recommendation,
        ch1_difficulty, ch2_difficulty, ch3_difficulty,
        mostDifficultTechnique, mostUsefulActivity,
        freeText,
        // 対照群
        difficulty, learning, freeText,
        completedAt
    }
```

## 6. ID事前登録

実験開始前に、IDと条件をFirestoreに一括登録する:

```javascript
// 登録スクリプト（管理者用）
const participants = [
    { id: 'IC-001', condition: 'experimental', testSetOrder: 'AB' },
    { id: 'IC-002', condition: 'control', testSetOrder: 'BA' },
    { id: 'IC-003', condition: 'experimental', testSetOrder: 'BA' },
    { id: 'IC-004', condition: 'control', testSetOrder: 'AB' },
    // ... ランダム化済みのリスト
];

participants.forEach(p => {
    setDoc(doc(db, 'participants', p.id), {
        ...p,
        status: 'assigned',
        createdAt: serverTimestamp(),
    });
});
```

カウンターバランス:
- 実験群の半数がAB順、半数がBA順
- 対照群も同様
- ブロックランダム化で均等配分

## 7. ゲーム側との連携

### 7-1. 研究ポータル → ゲーム

```
ボタンクリック時:
  window.location.href = `${GAME_URL}/?id=${participantId}`;
```

### 7-2. ゲーム → 研究ポータル

ゲーム完了時（Epilogue終了後）:
```javascript
// ゲーム側で実行
window.location.href = `${RESEARCH_URL}/?id=${participantId}&phase=postMediator`;
```

### 7-3. ゲーム側の変更

ゲーム側で必要な変更:
- URLパラメータから id を受け取る
- ゲームデータを participants/{id}/gameData に保存（現行の sessions/ とは別）
  または、participants/{id} に gameSessionId を保存して紐付ける
- 完了時に研究ポータルにリダイレクト

## 8. 状態復帰

参加者がブラウザを閉じて戻ってきた場合:
- URLの id から Firestore の status を確認
- 最後に完了したステップの次から再開
- 例: status === 'preTest' → 事前テスト完了済み → 次はintervention

## 9. コンポーネント構成

```
research-portal/
├── src/
│   ├── App.jsx                 # ルーティング + 状態管理
│   ├── pages/
│   │   ├── ConsentPage.jsx
│   │   ├── DemographicsPage.jsx
│   │   ├── MediatorPage.jsx    # 事前・事後共通（propsでtiming区別）
│   │   ├── TestPage.jsx        # 事前・事後共通（propsでtestSet区別）
│   │   ├── GameRedirectPage.jsx
│   │   ├── PlaceboPage.jsx
│   │   ├── SurveyPage.jsx      # condition で実験群/対照群版を切り替え
│   │   └── CompletePage.jsx
│   ├── components/
│   │   ├── LikertScale.jsx     # 7段階リカート尺度コンポーネント
│   │   ├── SNSPostCard.jsx     # テスト用の投稿カード（ゲーム版と別デザイン）
│   │   ├── ProgressBar.jsx     # ステップ進捗表示
│   │   └── RadioGroup.jsx
│   ├── data/
│   │   ├── testSets.js         # テストセットA/Bの問題データ
│   │   ├── mediatorItems.js    # 媒介変数の質問項目
│   │   └── placeboTexts.js     # プラセボ課題の読解文
│   ├── hooks/
│   │   └── useParticipant.js   # Firebase連携、状態管理
│   └── lib/
│       └── firebase.js         # Firebase初期化（ゲームと同じプロジェクト）
└── package.json
```

## 10. デザイン方針

- 白背景 (#ffffff) + グレーテキスト (#333333)
- フォント: システムフォント（sans-serif）
- 装飾なし、アニメーションなし
- ゲームの色彩（赤、紫、シアン等）を使わない
- SNSPostCard はゲーム版とは異なるシンプルなデザイン
  （ゲームのSNSPostCardを見て「あ、これゲームで見たやつだ」とならないように）
