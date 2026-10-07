/**
 * 自動生成記事のトピック候補。
 *
 * 置いてよいトピックの条件
 *   1. 1記事1検索意図。既存記事・ガイド・固定ページの意図と重ならない（固定ページとの取り合いは lib/seo-map.ts で検査）
 *   2. 固定ページでは扱いきれない「細かい疑問」（ロングテール）であること
 *   3. docs/VERIFIED_FACTS.md にある内容だけで書けること。
 *      事実シートに無い技術の一般論（効率・寿命・サイクル数・相場など）が必要な題材は置かない
 *      （書かせても品質ゲートに通らず、API の呼び出しが無駄になる）
 *   4. links の先頭が、その記事の「親」になる固定ページ（本文から必ずリンクする）
 *
 * local: true … 葛飾区に固有の題材。こちらを先に使う（地域に固有の内容を優先する）。
 * 使い切ったら generate はスキップする（無理に言い換え記事を作らない）。
 * 題材を足すときは、先に事実シートへ根拠（出典つき）を足す。
 */

export interface Topic {
  intent: string;
  /** 記事の URL（/blog/<slug>）。英小文字・数字・ハイフンで、内容が分かる名前にする。既存の記事と重ならないこと */
  slug: string;
  title: string;
  angle: string;
  category: string;
  /** 本文に必ず入れる固定ページ（2〜3本）。先頭がこの記事の親ページ */
  links: string[];
  /** 葛飾区に固有の題材 */
  local?: boolean;
}

export const topics: Topic[] = [
  // ───────── 葛飾区の補助金（区の案内・手引きにある決まりを、1つずつ掘り下げる）
  { local: true, intent: "かつしかエコ助成金 納税証明書 課税証明書 違い", slug: "katsushika-subsidy-tax-payment-certificate", title: "かつしかエコ助成金で出すのは「納税証明書」。課税証明書では足りない", angle: "区の案内にある注意点。必要なのは令和7年度の特別区民税・都民税・森林環境税の納税証明書の原本で、課税証明書ではない。証明書類は発行後3か月以内。同時に2項目以上を申し込む場合は1部でよい。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "かつしかエコ助成金 見積書 一式 内訳書", slug: "katsushika-subsidy-quote-breakdown", title: "見積書が「一式」だと困る理由：かつしかエコ助成金の見積書の決まり", angle: "区の手引きでは、機器本体の費用・工事費用・調整額がそれぞれ分かる見積書が必要で、一式表記の場合は内訳書を添付する。蓄電池の助成対象経費が本体価格＋工事代であることとの関係。太陽光発電協会も、内訳のある見積もりを確認点に挙げている。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/area/katsushika"] },
  { local: true, intent: "かつしかエコ助成金 名義 申請者 領収書 振込口座", slug: "katsushika-subsidy-applicant-name-rule", title: "申請者・領収書・振込口座の名義をそろえる：かつしかエコ助成金の名義の決まり", angle: "区の案内では、申請者＝建物居住者＝領収書の名義人＝助成金の振込名義人。太陽光は、電力会社との接続契約の契約者も申請者と同じ。契約の前に名義を決めておく。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "かつしかエコ助成金 賃貸 使用貸借 同意書", slug: "katsushika-subsidy-rental-owner-consent", title: "賃貸や使用貸借の家でも申請できる？かつしかエコ助成金と所有者の同意", angle: "賃貸住宅・使用貸借住宅は、住宅の所有者の同意が必要（同意書を提出）。自ら居住することが条件。リース・レンタルでの導入は対象外。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/faq"] },
  { local: true, intent: "かつしかエコ助成金 建売 太陽光付き 引渡し 4週間前", slug: "katsushika-subsidy-new-build-with-solar", title: "太陽光付きの建売住宅を買うとき、かつしかエコ助成金はいつ申し込む？", angle: "機器付きの建売住宅を購入する場合は、建物の引渡しの4週間前までに事前協議書を申し込む。東京都の新築区分（3.6kW が境）との関係。住宅の販売・譲渡を目的とする場合は対象外。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/subsidy/tokyo"] },
  { local: true, intent: "かつしかエコ助成金 併設加算 既設 太陽光 蓄電池 後付け", slug: "katsushika-subsidy-addon-existing-solar", title: "太陽光がある家に蓄電池を足すと、併設加算の5万円は付く？", angle: "区の案内では、併設加算は「一方が既設の機器に併設する場合」と「両方を同時に設置する場合」のどちらも対象。既設の太陽光に蓄電池を併設するときは、売電を確認できる書類の写し（発行から3か月以内）を追加で出す。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/solar-battery"] },
  { local: true, intent: "かつしかエコ助成金 完了報告 期限 書類", slug: "katsushika-subsidy-completion-report", title: "工事が終わったら出す書類と期限：かつしかエコ助成金の完了報告", angle: "完了報告の最終提出期限は2027年12月28日（必着）。太陽光と蓄電池それぞれの、完了報告時の必要書類（手引きの一覧）。期限を過ぎると交付されない。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "かつしかエコ助成金 振込 いつ 交付額確定通知書", slug: "katsushika-subsidy-payment-timing", title: "かつしかエコ助成金はいつ振り込まれる？完了報告から交付までの目安", angle: "区は通常3〜4週間程度で処理していると案内。申請が集中した場合は長くなり、令和7年度は最大で6か月程度かかった。資金計画は、助成金が後から入る前提で立てる。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "かつしかエコ助成金 リース レンタル キャッシュバック 対象外", slug: "katsushika-subsidy-lease-cashback-excluded", title: "リースやキャッシュバック付きの契約は対象外：かつしかエコ助成金と契約の形", angle: "区の助成は、リース・レンタルを対象外としている。助成金の交付後に代金還元（キャッシュバック）を受けないことも要件。区の決まりに絞って書く（自己所有・PPA・リースの違いや東京都の初期費用ゼロの助成は /guide/zero-yen-solar が受けるので、そこへ案内する）。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/guide/zero-yen-solar"] },
  { local: true, intent: "かつしかエコ助成金 事前協議 申請内容 変更 機種変更", slug: "katsushika-subsidy-change-after-consultation", title: "事前協議のあとで機種を変えたくなったら？申請内容は原則変えられない", angle: "区の案内では、事前協議書の提出後は、やむを得ない事情以外の申請内容の変更は原則認められない。機種・容量・見積もりを固めてから申し込む段取り。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "かつしかエコ助成金 回答書 届く前 着工 対象外", slug: "katsushika-subsidy-no-start-before-reply", title: "区の事前協議回答書が届く前に、工事を始めてはいけない理由", angle: "回答書の前に着工すると対象外になる決まり。申込受付から回答書の到着まで3〜4週間程度。工事の日程を、契約日ではなく回答書の到着を基準に組む。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "葛飾区 太陽光 補助金 年度末 申請 間に合う", slug: "katsushika-subsidy-year-end-deadline", title: "年度末に葛飾区の太陽光補助金を申請するときの、日付の逆算", angle: "申込期間は2027年3月31日（必着）まで。着工の4週間前までに事前協議、回答書までは3〜4週間程度、完了報告の最終期限は2027年12月28日。郵送の場合は区に届いた日が受付日。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/flow"] },
  { local: true, intent: "葛飾区 太陽光 補助金 過去10年 再申請", slug: "katsushika-subsidy-ten-year-rule", title: "過去に区の助成を受けた家は、もう一度申請できる？10年の決まりの読み方", angle: "申請時点から過去10年間に、同じ建物・同じ種類の機器で区の助成を受けていないこと、という要件の整理。種類が違う機器（太陽光と蓄電池）の関係。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/faq"] },
  { local: true, intent: "かつしかエコ助成金 JET認証 太陽光パネル 確認", slug: "katsushika-subsidy-jet-certification", title: "太陽光パネルの「JET認証」とは：かつしかエコ助成金の対象かを確かめる", angle: "区の要件：JETの太陽電池モジュール認証、またはIECの認証制度に加盟する海外認証機関の認証。申込時に、認証の登録リストの該当範囲を印刷して出す。公称最大出力の合計が1kW以上であること。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/products/solar"] },
  { local: true, intent: "かつしかエコ助成金 HEMS 2万円 併設加算 ECHONET Lite", slug: "katsushika-subsidy-hems-echonet-lite", title: "HEMSの助成2万円と、太陽光との併設加算1万円：対象になるHEMSの条件", angle: "HEMSは2万円/1台まで。太陽光との併設加算は一律1万円で、一方が既設の場合も対象。対象は ECHONET Lite を標準的なインターフェースとして搭載しているもの。", category: "katsushika-subsidy", links: ["/hems", "/subsidy/katsushika"] },
  { local: true, intent: "葛飾区 太陽光 訪問販売 区の委託 名乗る 注意", slug: "katsushika-solar-door-to-door-sales-warning", title: "「葛飾区から委託を受けている」と名乗る業者に注意：区が呼びかけていること", angle: "区は特定の業者に営業・販売を委託しておらず、業者の紹介もしていない。区は複数業者からの見積もりを推奨し、契約を急がせる業者に注意を呼びかけている。太陽光発電協会が挙げる、契約時の確認点（書面で残す・クーリング・オフの説明）。", category: "install-maintenance", links: ["/area/katsushika", "/flow"] },
  { local: true, intent: "葛飾区 東京都 補助金 併用 申請 順番", slug: "katsushika-tokyo-subsidy-combination-order", title: "区と都の補助金を両方使うときの順番：区の交付が先、都の実績報告があと", angle: "葛飾区の案内では国や都の制度との併用が可能（合計は助成対象経費が上限）。東京都の太陽光の助成は、区の補助金を受給した後で交付申請兼実績報告を行う。区と都の金額は別々に示す。", category: "katsushika-subsidy", links: ["/subsidy/katsushika", "/subsidy/tokyo"] },

  // ───────── 東京都の補助金
  // 東京都の太陽光の単価の境目（既存 3.75kW・新築 3.6kW）は、既存の記事 tokyo-solar-subsidy-2026-examples が計算例つきで受けている（新しく書かない）
  { intent: "東京都 蓄電池 増設 助成 6万円", slug: "tokyo-battery-expansion-subsidy", title: "蓄電池を増設するときの東京都の助成（6万円/kWh）の考え方", angle: "新規10万円/kWhと増設6万円/kWh（DR不参加時 上限72万円/戸）の違い。2026年10月1日以降の事前申込はSII登録機器に限ること。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/battery"] },
  { intent: "東京都 太陽光 陸屋根 架台 防水 助成", slug: "tokyo-solar-flat-roof-mount-waterproof", title: "陸屋根の家で太陽光：東京都の架台・防水工事の追加助成", angle: "既存戸建の架台設置10万円/kW、防水工事18万円/kW（条件あり）の位置づけ。太陽光発電協会の説明する、屋根置き型（勾配屋根・陸屋根）の設置方法。詳細な条件は公式で確認する。", category: "tokyo-subsidy", links: ["/subsidy/tokyo", "/guide/roof-conditions"] },

  // ───────── 太陽光・導入の進め方（太陽光発電協会の資料の範囲で書けるもの）
  { intent: "太陽光 現地調査 何を見る 準備", slug: "solar-site-survey-what-to-prepare", title: "太陽光の現地調査では何を見る？事前に用意しておくもの", angle: "太陽光発電協会の説明：屋根の面積・形状・方位・傾斜は発電量に影響する。周りに太陽光を遮るものがないか。設計図面や検針票を用意する。見積もりは屋根の方位・形状・屋根材をもとに作られる。", category: "install-maintenance", links: ["/flow", "/guide/roof-conditions"] },
  { intent: "太陽光 工事 当日 流れ 連系 立会い", slug: "solar-installation-day-to-operation", title: "太陽光の工事当日から運転開始まで：連系立会いと保証書の受け取り", angle: "太陽光発電協会の説明：機器設置工事と電気配線工事、竣工検査と引き渡し、電力会社との電力受給契約と連系立会い、メーカー発行の保証書の受け取り。葛飾区の助成では、このあとに完了報告を出す。期間の断定はしない。", category: "install-maintenance", links: ["/flow", "/subsidy/katsushika"] },

  // ───────── 設置したあと（東京都のQ&Aと太陽光発電協会の資料の範囲で書けるもの）
  { intent: "太陽光 発電量 落ちた 前年比 不具合 確認", slug: "solar-output-drop-25-percent-check", title: "発電量が前年より25％減ったら？太陽光の不具合に気づくための確認", angle: "東京都のQ&Aによると、一般的な住宅地では定期的に屋根に登って掃除する必要はほとんどなく、発電量を日常的に確認することを都は勧めている。1か月の発電電力量が前年の同じ月とくらべて25％程度低下する場合は、不具合の可能性があるのでメーカーなどに相談する。太陽光発電協会の説明する定期点検（3〜5年ごと）や、点検は専門の業者に任せること。屋根の上の作業は自分でしない。", category: "install-maintenance", links: ["/guide/maintenance", "/guide/solar-safety"] },
  { intent: "太陽光 撤去 補助金 返還 17年 廃止届", slug: "solar-removal-subsidy-refund-17-years", title: "補助金で付けた太陽光を早めに外すと、返還が必要になる？撤去の前に確かめること", angle: "東京都のQ&A（太陽光発電協会のサイトから引用）：FITの認定を受けている場合は廃止届が必要。補助金を受けて設置した場合、法定耐用年数（17年）に満たないうちに廃棄する場合などは、補助金を返還しないといけないケースがある。架台を屋根に固定する金具を外す場合は、屋根の防水処理が必要。撤去はまず購入した販売店か施工店に相談し、連絡がつかない場合はメーカーの相談窓口へ。太陽光パネルはリサイクルできる。区や都の個別の返還の条件は、それぞれの交付要綱で確かめる（事実シートに無い条件は書かない）。", category: "install-maintenance", links: ["/guide/solar-safety", "/subsidy/katsushika"] },

  // ───────── FIT・売電
  { intent: "東京電力 出力制御 住宅用 太陽光 対象外 2026", slug: "tepco-output-curtailment-residential-solar", title: "東京電力管内の住宅用太陽光は、出力制御で売電が止まる？", angle: "東京都のQ&Aによると、固定価格買取制度の東京電力管内のルールでは、住宅用太陽光（10kW未満）は当面の間、出力制御の実施対象外。2026年度の東京電力管内の再エネ出力制御の見通し（出力制御率）は0.03％で、10kW未満の太陽光は当面の間、対象外。住宅用（10kW未満）は余剰買取で、家で使った残りが売電される（資源エネルギー庁・太陽光発電協会）。将来ルールが変わるかどうかの予想は書かない。売電の単価は /guide/selling-electricity に任せる。", category: "fit", links: ["/guide/selling-electricity", "/solar"] },
  { intent: "FIT 5年目 8.3円 どうする 自家消費", slug: "fit-fifth-year-8-3yen-self-consumption", title: "FIT5年目から売電が8.3円に：そのとき家でできること", angle: "2026年度の住宅用は最初の4年間24円/kWh、5〜10年目8.3円/kWh。太陽光発電協会の説明：昼間に電気を使う、エコキュートを太陽光の電気で沸かす、蓄電池や電気自動車と組み合わせる。効果の数値は書かない。", category: "fit", links: ["/guide/selling-electricity", "/solar-battery"] },

];
