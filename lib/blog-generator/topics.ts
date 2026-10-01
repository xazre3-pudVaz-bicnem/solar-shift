/**
 * 自動生成記事のトピック候補。
 * - intent は「1記事1検索意図」。既存記事・ガイドページの intent と重複しないものだけを置く。
 * - 初期記事（content/blog）とガイド（data/guides.ts）が扱うテーマは入れない。
 * - 使い切ったら generate はスキップする（無理に言い換え記事を作らない）。
 */

export interface Topic {
  intent: string;
  title: string;
  angle: string;
  category: string;
  /** 本文に必ず入れる固定ページ（2〜3本） */
  links: string[];
}

export const topics: Topic[] = [
  // ───────── 葛飾区の補助金
  { intent: "かつしかエコ助成金 事前協議 書類", title: "かつしかエコ助成金の事前協議で準備する書類と提出の流れ", angle: "見積書・仕様書など、着工4週間前の事前協議に向けて何を揃えるか。区の窓口情報と注意点。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { intent: "かつしかエコ助成金 回答書 届かない 着工", title: "区の事前協議回答書が届く前に工事を始めてはいけない理由", angle: "回答書前の着工が対象外になる仕組みと、工事日程を回答書基準で組む考え方。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { intent: "かつしかエコ助成金 HEMS 併設加算", title: "太陽光とHEMSを同時に申請すると加算される1万円の条件", angle: "HEMS2万円/台と併設加算1万円を同時申請で使う考え方。HEMSを入れる意味とセット。", category: "katsushika-subsidy", links: ["/hems", "/subsidy/katsushika"] },
  { intent: "葛飾区 太陽光 補助金 年度末 申請 間に合う", title: "年度末に葛飾区の太陽光補助金を申請するときの注意点", angle: "申込期間の締切（必着）、審査の集中、着工4週間前の事前協議から逆算した最終ライン。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { intent: "葛飾区 太陽光 補助金 過去10年 再申請", title: "過去に区の助成を受けた家は、もう一度申請できる？10年ルールの読み方", angle: "同じ建物・同じ種類の機器で過去10年間に区の助成を受けていないこと、という条件の整理。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/faq"] },
  { intent: "葛飾区 新築 太陽光 補助金 引渡し前", title: "葛飾区で新築に太陽光を載せるとき、助成金はいつ申請する？", angle: "新築は引渡しの4週間前までに事前協議。東京都の新築区分（3.6kW境）との関係。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/subsidy/tokyo"] },
  // ───────── 東京都の補助金
  { intent: "東京都 太陽光 助成 事前申込 タイミング", title: "東京都の太陽光助成はいつ事前申込する？契約・工事との順番", angle: "事前申込→交付申請兼実績報告の流れと、区の事前協議と並行して進める段取り。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/flow"] },
  { intent: "東京都 太陽光 補助金 3.75kW 境目 容量", title: "東京都の太陽光助成は3.75kWが境目：容量の決め方への影響", angle: "15万円/kW（上限45万円）と12万円/kWの区分が容量全体に適用される仕組みの計算例。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/simulation"] },
  { intent: "東京都 蓄電池 助成 DR 実証 参加 とは", title: "東京都の蓄電池助成で出てくる「DR実証」とは何か", angle: "デマンドレスポンスの意味、参加で加算や上限の扱いが変わること（具体額は公式確認）、HEMSとの関係。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/hems"] },
  { intent: "東京都 太陽光 陸屋根 架台 助成", title: "陸屋根の家で太陽光：東京都の架台・防水工事の追加助成", angle: "既存戸建の架台設置10万円/kW、防水工事18万円/kW（条件あり）の位置づけと、陸屋根の設置の考え方。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/guide/roof-conditions"] },
  { intent: "東京都 蓄電池 増設 助成 6万円", title: "蓄電池を増設するときの東京都の助成（6万円/kWh）の考え方", angle: "新規10万円/kWhと増設6万円/kWhの違い、増設が向くケース。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/battery"] },
  // ───────── 太陽光
  { intent: "太陽光 自家消費率 上げる 方法", title: "太陽光の自家消費率を上げる5つの方法", angle: "昼間に家電を回す、エコキュートの昼沸き上げ、蓄電池、HEMS、EV充電。売電24円→8.3円の切り替わりを前提に。", category: "solar", links: ["/solar-battery", "/guide/selling-electricity"] },
  { intent: "太陽光 影 隣家 発電量 影響", title: "隣の家の影は太陽光にどれだけ影響する？葛飾区の住宅地で確認すること", angle: "影の時間帯・季節変化、配置とパワコン（ストリング）の考え方。具体的な発電量は書かない。", category: "solar", links: ["/guide/roof-conditions", "/area/katsushika"] },
  { intent: "太陽光 パネル 枚数 何枚 載る", title: "太陽光パネルは何枚載る？屋根面積から容量を見積もる考え方", angle: "1枚の出力×枚数＝容量、屋根の形と離隔、補助金の区分との関係。", category: "solar", links: ["/products/solar", "/guide/solar-cost"] },
  { intent: "太陽光 現地調査 何を見る 準備", title: "太陽光の現地調査では何を見る？事前に用意しておくもの", angle: "屋根・分電盤・設置スペース・影・電気の使用量。図面や電気料金明細の準備。", category: "install-maintenance", links: ["/flow", "/contact"] },
  { intent: "太陽光 足場 必要 費用 理由", title: "太陽光の工事に足場は必要？費用に影響する理由", angle: "安全・屋根材・敷地条件。葛飾区の狭小地での組み方。具体額は書かない。", category: "install-maintenance", links: ["/guide/solar-cost", "/flow"] },
  // ───────── 蓄電池
  { intent: "蓄電池 全負荷 特定負荷 どっち", title: "全負荷型と特定負荷型、わが家はどっち？停電時に使いたいもので決める", angle: "冷蔵庫・通信・照明・エアコン（200V）など優先順位で選ぶ。", category: "battery", links: ["/guide/battery-how-to-choose", "/battery"] },
  { intent: "蓄電池 設置場所 屋外 屋内 条件", title: "蓄電池の設置場所：屋外・屋内それぞれの条件と確認ポイント", angle: "温度・直射日光・搬入経路・浸水想定（葛飾区）・騒音。", category: "battery", links: ["/battery", "/guide/blackout"] },
  { intent: "蓄電池 寿命 サイクル 保証", title: "蓄電池の寿命はどう見る？サイクル数と容量保証の読み方", angle: "一般論の範囲で。年数の断定はしない。保証条件の見方。", category: "battery", links: ["/guide/battery-how-to-choose", "/guide/maintenance"] },
  { intent: "蓄電池 SII 登録 確認 方法 型番", title: "蓄電池がSII登録機器か確認する方法：型番で調べる手順", angle: "東京都の助成要件（2026年10月以降）に関わる確認手順。メーカー・施工店・SII一覧。", category: "battery", links: ["/subsidy/tokyo", "/products/battery"] },
  // ───────── V2H
  { intent: "V2H 対応車種 確認 方法", title: "V2Hは自分の車で使える？対応車種と機器の確認手順", angle: "車種・機器の組み合わせ、購入前の確認、停電時の運用。", category: "v2h", links: ["/v2h", "/subsidy/katsushika"] },
  { intent: "V2H 蓄電池 どっち 選ぶ", title: "V2Hと家庭用蓄電池、どちらを先に入れる？", angle: "車の使い方（平日外出）と停電時の備えで役割分担を決める。", category: "v2h", links: ["/v2h", "/battery"] },
  // ───────── 電気代
  { intent: "電気代 時間帯 料金プラン 太陽光 相性", title: "太陽光・蓄電池と電気料金プランの相性：時間帯別料金の考え方", angle: "具体的な単価は書かない。昼安い・夜安いプランと設備の組み合わせの考え方。", category: "electricity-bill", links: ["/solar-battery", "/guide/all-electric"] },
  { intent: "電気代 明細 見方 太陽光 検討", title: "太陽光を検討する前に電気料金明細で確認する3つの数字", angle: "使用量・時間帯・契約容量の見方。具体的な料金は書かない。", category: "electricity-bill", links: ["/solar", "/contact"] },
  // ───────── 停電・防災
  { intent: "在宅避難 電気 備え 太陽光 蓄電池", title: "在宅避難の電気の備え：太陽光・蓄電池で何日持つかの考え方", angle: "日数の断定はしない。優先回路・日中充電・ハザードマップ確認。", category: "blackout", links: ["/guide/blackout", "/area/katsushika"] },
  { intent: "停電 自立運転 切り替え 方法", title: "停電時の自立運転への切り替え方：事前に確認しておくこと", angle: "手動／自動切替、専用コンセントの位置、家族で共有すること。機種差は一般論で。", category: "blackout", links: ["/guide/blackout", "/battery"] },
  // ───────── 商品比較
  { intent: "太陽光パネル 単結晶 多結晶 違い", title: "単結晶と多結晶の違いは今も気にすべき？パネル選びの現在地", angle: "一般論。効率の具体値は書かない。保証と施工性で選ぶ視点。", category: "product-comparison", links: ["/products/solar", "/recommend/solar"] },
  { intent: "ハイブリッド 蓄電池 単機能 違い 比較", title: "ハイブリッド型と単機能型の蓄電池を比較：同時導入と後付けで変わる答え", angle: "パワコン1台／2台、変換ロス、後付け時の選択。", category: "product-comparison", links: ["/products/battery", "/solar-battery"] },
  // ───────── 施工・メンテ
  { intent: "太陽光 発電量 モニター 異常 気づく", title: "発電量モニターで異常に気づくための見方", angle: "季節変動と急な低下の見分け方。数値の断定はしない。保証の使い方。", category: "install-maintenance", links: ["/guide/maintenance", "/hems"] },
  { intent: "太陽光 屋根 葺き替え 同時 タイミング", title: "屋根の葺き替えと太陽光は同時にやるべき？タイミングの考え方", angle: "築年数・屋根材・足場の共用。費用の具体額は書かない。", category: "install-maintenance", links: ["/guide/roof-conditions", "/guide/solar-cost"] },
  // ───────── FIT・売電
  { intent: "売電 手続き 流れ 電力会社 連系", title: "売電を始めるまでの手続き：系統連系の申請から検針まで", angle: "電力会社への申請、FIT認定、運転開始の流れ。期間の断定はしない。", category: "fit", links: ["/guide/selling-electricity", "/flow"] },
  { intent: "FIT 5年目 8.3円 どうする 自家消費", title: "FIT5年目から売電が8.3円に：そのとき家でできる3つの対策", angle: "2026年度の24円→8.3円を前提に、蓄電池・エコキュート・使い方の調整。", category: "fit", links: ["/guide/post-fit", "/solar-battery"] },
  // ───────── 省エネ
  { intent: "エコキュート 昼間 沸き上げ 太陽光", title: "エコキュートの昼間沸き上げで太陽光の電気を使い切る", angle: "設定の考え方、蓄電池との役割分担。効果の数値は書かない。", category: "energy-saving", links: ["/guide/all-electric", "/hems"] },
  { intent: "HEMS 見える化 電気 使い方 変わる", title: "HEMSで電気の使い方はどう変わる？見える化の活用例", angle: "家庭での使い方例。効果の断定はしない。", category: "energy-saving", links: ["/hems", "/solar-battery"] },
];
