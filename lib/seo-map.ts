/**
 * SEO キーワードマップ（固定ページの「主キーワード・検索意図・役割」の一覧）。
 *
 * 目的はカニバリ（同じ検索意図をサイト内の複数ページで取り合うこと）を防ぐこと。
 *   1. 主キーワード（primary）は1ページに1つ。ほかのページと重ねない
 *   2. ブログ記事はロングテール（より細かい疑問）だけを受け、対応する固定ページへ必ずリンクする
 *   3. 自動生成記事は、ここにある固定ページのキーワードと重なる題材なら公開しない
 *      （lib/blog-generator/validate.ts が findCannibalPage を使う）
 *
 * ページの title / h1 がここと合っているかは scripts/seo-check.ts がビルド後の HTML で検査する。
 * ページを増やす・役割を変えるときは、まずここを直す。
 *
 * このファイルは Node のスクリプト（tsx）からも読むので、"@/…" の別名や fs は使わない。
 */

export interface SeoEntry {
  path: string;
  /** 主キーワード（1ページに1つ・重複禁止） */
  primary: string;
  /** そのページで一緒に受けるキーワード */
  secondary: string[];
  /** 検索意図：このページが答える問い */
  intent: string;
  /** 似たページとの役割の違い */
  role: string;
  /** title と h1 の両方に入っているべき語 */
  must: string[];
  /** 検索結果に出すか。false のページは noindex・sitemap 対象外（中身が揃ってから true にする） */
  index: boolean;
}

export const SEO_MAP: SeoEntry[] = [
  {
    path: "/",
    primary: "葛飾区 太陽光発電",
    secondary: ["葛飾区 太陽光", "葛飾区 蓄電池"],
    intent: "葛飾区で太陽光発電・蓄電池を頼めるサービスの全体像を知りたい",
    role: "入口。概要だけを見せ、詳細は各固定ページへ送る。補助金の細目・業者選び・機器の解説は書かない",
    must: ["葛飾区", "太陽光発電", "蓄電池"],
    index: true,
  },
  {
    path: "/subsidy/katsushika",
    primary: "葛飾区 太陽光 補助金",
    secondary: ["葛飾区 太陽光発電 補助金", "葛飾区 蓄電池 補助金", "かつしかエコ助成金"],
    intent: "葛飾区の補助金の金額・条件・申請の順番・必要書類を正確に知りたい",
    role: "葛飾区の補助金の正本。金額・要件・書類・時系列はここだけに詳しく書く",
    must: ["葛飾区", "太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/area/katsushika",
    primary: "葛飾区 太陽光 業者",
    secondary: ["葛飾区 太陽光 施工", "葛飾区 太陽光 会社", "葛飾区 蓄電池 業者"],
    intent: "葛飾区で太陽光・蓄電池を頼める業者（会社）と、対応している地域・進め方を知りたい",
    role: "葛飾区の業者としての案内。会社・対応地域・相談の進め方・業者選びの確認点。補助金の表や機器の解説は各ページへ送る",
    must: ["葛飾区", "太陽光", "蓄電池", "業者"],
    index: true,
  },
  {
    path: "/subsidy",
    primary: "太陽光 蓄電池 補助金 2026",
    secondary: ["太陽光 補助金 2026", "太陽光 蓄電池 補助金 併用"],
    intent: "区・都・国の補助金の全体像と、申請の順番を知りたい",
    role: "3つの制度の入口。各制度の細目は書き写さず、それぞれのページへ送る",
    must: ["太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/subsidy/tokyo",
    primary: "東京都 太陽光 補助金",
    secondary: ["東京都 蓄電池 補助金", "クール・ネット東京 太陽光"],
    intent: "東京都の家庭向け太陽光・蓄電池助成の金額と条件を知りたい",
    role: "東京都の助成の正本",
    must: ["東京都", "太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/subsidy/national",
    primary: "国 蓄電池 補助金",
    secondary: ["DR補助金 家庭用蓄電池", "CEV補助金 V2H", "みらいエコ住宅 蓄電池"],
    intent: "国の補助金がいま使えるのかを知りたい",
    role: "国の制度の受付状況の正本",
    must: ["国", "補助"],
    index: true,
  },
  {
    path: "/simulation",
    primary: "太陽光 補助金 シミュレーション",
    secondary: ["葛飾区 補助金 試算", "蓄電池 補助金 計算"],
    intent: "わが家の条件で補助金がいくらになるか試算したい",
    role: "試算の道具。制度の解説は補助金ページへ送る",
    must: ["補助金", "シミュレーション"],
    index: true,
  },
  {
    path: "/solar",
    primary: "住宅用 太陽光発電",
    secondary: ["太陽光発電 仕組み", "太陽光 容量 決め方"],
    intent: "住宅用太陽光発電の仕組みと、わが家に向くかを知りたい",
    role: "太陽光発電の基礎の正本。「葛飾区 太陽光発電」はトップページが受けるので、タイトルの先頭に地域名を置かない",
    must: ["住宅用太陽光発電"],
    index: true,
  },
  {
    path: "/battery",
    primary: "家庭用 蓄電池",
    secondary: ["蓄電池 選び方", "蓄電池 容量 決め方"],
    intent: "家庭用蓄電池の役割と選び方を知りたい",
    role: "蓄電池の基礎と選び方の正本。種類ごとの細かい比較は /guide/battery-how-to-choose へ送る",
    must: ["家庭用蓄電池"],
    index: true,
  },
  {
    path: "/solar-battery",
    primary: "太陽光 蓄電池 セット",
    secondary: ["太陽光 蓄電池 同時 導入", "太陽光 蓄電池 併設加算"],
    intent: "太陽光と蓄電池を一緒に入れる意味と、電気の流れを知りたい",
    role: "同時導入の考え方の正本",
    must: ["太陽光", "蓄電池"],
    index: true,
  },
  {
    path: "/v2h",
    primary: "V2H とは",
    secondary: ["V2H 仕組み", "V2H 蓄電池 違い"],
    intent: "V2Hの仕組みと、家庭用蓄電池との違いを知りたい",
    role: "V2Hの基礎の正本。補助金の最新状況は記事と補助金ページが受ける",
    must: ["V2H"],
    index: true,
  },
  {
    path: "/hems",
    primary: "HEMS とは",
    secondary: ["HEMS 補助金 葛飾区", "HEMS 必要"],
    intent: "HEMSで何ができるか、必要かどうかを知りたい",
    role: "HEMSの基礎の正本",
    must: ["HEMS"],
    index: true,
  },
  {
    path: "/products",
    primary: "太陽光 蓄電池 取扱メーカー",
    secondary: ["太陽光パネル 蓄電池 選び方", "太陽光 メーカー 選び方"],
    intent: "どのメーカーを扱っているか、太陽光パネル・蓄電池をどんな項目で比べればよいかを知りたい",
    role: "取扱メーカーの一覧と、比べ方の入口。個別の商品・仕様の数値は載せない",
    must: ["メーカー", "選び方"],
    index: true,
  },
  {
    path: "/products/solar",
    primary: "太陽光パネル 比較 見方",
    secondary: ["太陽光パネル 出力 変換効率 見方"],
    intent: "太陽光パネルのカタログのどこを見ればよいかを知りたい",
    role: "パネルの仕様の読み方",
    must: ["太陽光パネル"],
    index: true,
  },
  {
    path: "/products/battery",
    primary: "蓄電池 比較 見方",
    secondary: ["蓄電池 容量 出力 見方"],
    intent: "蓄電池のカタログのどこを見ればよいかを知りたい",
    role: "蓄電池の仕様の読み方",
    must: ["蓄電池"],
    index: true,
  },
  {
    path: "/works",
    primary: "葛飾区 太陽光 施工事例",
    secondary: [],
    intent: "実際の施工事例を見たい",
    role: "掲載の許可をいただいた事例だけを載せる。事例が0件のあいだは noindex（lib/indexing.ts）",
    must: ["施工事例"],
    index: true,
  },
  {
    path: "/voice",
    primary: "SOLAR SHIFT 口コミ",
    secondary: [],
    intent: "利用した人の声を知りたい",
    role: "実際にいただいた声だけを載せる。登録されるまでは noindex",
    must: ["お客様の声"],
    index: false,
  },
  {
    path: "/reason",
    primary: "SOLAR SHIFT とは",
    secondary: ["SOLAR SHIFT 特徴"],
    intent: "SOLAR SHIFT がどんな考え方のサービスかを知りたい",
    role: "サービスの考え方。実績や順位などの主張は書かない",
    must: ["SOLAR SHIFT"],
    index: true,
  },
  {
    path: "/flow",
    primary: "太陽光 導入 流れ",
    secondary: ["太陽光 工事 流れ", "蓄電池 設置 流れ"],
    intent: "相談から設置・導入後までの流れを知りたい",
    role: "導入全体の流れ。区の申請書類の細目は /subsidy/katsushika へ送る",
    must: ["太陽光", "流れ"],
    index: true,
  },
  {
    path: "/area",
    primary: "SOLAR SHIFT 対応エリア",
    secondary: ["葛飾区 周辺 太陽光 対応エリア"],
    intent: "自分の住所が対応エリアかを知りたい",
    role: "対応エリアの一覧と、区ごとの補助金のちがいの早見表。区ごとの詳細は各ページへ送る",
    must: ["対応エリア"],
    index: true,
  },
  {
    path: "/area/adachi",
    primary: "足立区 太陽光 補助金",
    secondary: ["足立区 蓄電池 補助金", "足立区 太陽光発電 補助金", "足立区 太陽光 業者"],
    intent: "足立区に太陽光・蓄電池の補助金があるか、金額と申請の時期を知りたい",
    role: "足立区の制度の要点（区の公式ページで確かめた範囲）と、SOLAR SHIFT に頼む場合の注意。葛飾区の制度の説明を流用しない",
    must: ["足立区", "太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/area/sumida",
    primary: "墨田区 太陽光 補助金",
    secondary: ["墨田区 蓄電池 補助金", "墨田区 太陽光発電 補助金", "墨田区 太陽光 業者"],
    intent: "墨田区に太陽光・蓄電池の助成があるか、金額と申請の時期を知りたい",
    role: "墨田区の制度の要点（区の公式ページとパンフレットで確かめた範囲）と、SOLAR SHIFT に頼む場合の注意",
    must: ["墨田区", "太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/area/edogawa",
    primary: "江戸川区 太陽光 補助金",
    secondary: ["江戸川区 蓄電池 補助金", "江戸川区 太陽光発電 補助金", "江戸川区 太陽光 業者"],
    intent: "江戸川区に太陽光・蓄電池の補助金があるかを知りたい",
    role: "江戸川区の制度の現状（単独の補助は終了）と、使える東京都の助成への案内",
    must: ["江戸川区", "太陽光", "蓄電池", "補助金"],
    index: true,
  },
  {
    path: "/faq",
    primary: "太陽光 蓄電池 よくある質問",
    secondary: [],
    intent: "太陽光・蓄電池・補助金の疑問をまとめて確かめたい",
    role: "質問と回答の一覧",
    must: ["よくある質問"],
    index: true,
  },
  {
    path: "/guide",
    primary: "太陽光 蓄電池 ガイド",
    secondary: [],
    intent: "導入前に知っておきたいことを順に読みたい",
    role: "ガイドの入口",
    must: ["ガイド"],
    index: true,
  },
  { path: "/guide/solar-cost", primary: "太陽光発電 費用", secondary: ["葛飾区 太陽光 費用"], intent: "太陽光発電の費用の内訳と考え方を知りたい", role: "費用の考え方（相場の金額は書かない）", must: ["太陽光発電", "費用"], index: true },
  { path: "/guide/solar-payback", primary: "太陽光発電 元が取れる", secondary: ["太陽光 元を取る 何年", "太陽光 回収年数 計算"], intent: "太陽光発電が何年で元が取れるのか、どう計算すればよいかを知りたい", role: "回収年数の式と前提、試算の道具。費用の内訳は /guide/solar-cost、売電の仕組みは /guide/selling-electricity が受ける", must: ["太陽光発電", "元が取れる"], index: true },
  { path: "/guide/tokyo-solar-mandate", primary: "東京都 太陽光 義務化", secondary: ["太陽光パネル 義務化 既存住宅", "東京都 太陽光 義務化 いつから"], intent: "東京都の太陽光パネル設置義務化の対象・既存住宅の扱い・いつからかを知りたい", role: "義務化の制度の説明（東京都の資料の範囲）。東京都の助成の金額は /subsidy/tokyo が受ける", must: ["東京都", "義務化"], index: true },
  { path: "/guide/solar-safety", primary: "太陽光パネル 火災", secondary: ["太陽光パネル 台風", "太陽光パネル 火災保険", "太陽光 水害"], intent: "太陽光パネルの火災・台風・水害のリスクと、保険・撤去の扱いを知りたい", role: "安全性と災害時の扱い（東京都のQ&Aの範囲）。停電時の使い方は /guide/blackout、点検は /guide/maintenance が受ける", must: ["太陽光パネル", "火災"], index: true },
  { path: "/guide/zero-yen-solar", primary: "0円ソーラー", secondary: ["太陽光 リース PPA 違い", "0円ソーラー 後悔"], intent: "初期費用0円の太陽光（リース・PPA）の仕組みと、購入との違いを知りたい", role: "導入方法の違いと確認点。費用の内訳は /guide/solar-cost、回収年数は /guide/solar-payback が受ける", must: ["0円ソーラー"], index: true },
  { path: "/guide/renewable-energy-surcharge", primary: "再エネ賦課金 2026", secondary: ["再エネ賦課金 計算", "再エネ賦課金 推移", "再エネ賦課金 太陽光 自家消費"], intent: "再エネ賦課金の今年度の単価と、計算のしかた、太陽光を載せたときの負担の変わり方を知りたい", role: "再エネ賦課金の説明（国・東京都の資料の範囲）。売電の単価は /guide/selling-electricity、回収年数は /guide/solar-payback が受ける", must: ["再エネ賦課金"], index: true },
  { path: "/guide/solar-tax", primary: "太陽光 売電 確定申告", secondary: ["売電収入 税金", "太陽光 補助金 確定申告", "太陽光 固定資産税"], intent: "売電収入に税金がかかるか、確定申告が必要か、住民税・補助金・固定資産税の扱いを知りたい", role: "税金の説明（国税庁・葛飾区・東京都主税局の資料の範囲）。売電の仕組みと単価は /guide/selling-electricity が受ける", must: ["売電", "確定申告"], index: true },
  { path: "/guide/solar-merit-demerit", primary: "太陽光発電 メリット デメリット", secondary: [], intent: "導入の利点と注意点を両方知りたい", role: "判断材料", must: ["メリット", "デメリット"], index: true },
  { path: "/guide/solar-lifespan", primary: "太陽光パネル 寿命", secondary: ["パワコン 寿命"], intent: "機器が何年くらい使えるかを知りたい", role: "耐用年数と保証の見方（業界団体の資料の範囲）", must: ["寿命"], index: true },
  { path: "/guide/battery-cost", primary: "蓄電池 費用", secondary: [], intent: "蓄電池の費用の考え方を知りたい", role: "費用の考え方（相場の金額は書かない）", must: ["蓄電池", "費用"], index: true },
  { path: "/guide/battery-how-to-choose", primary: "蓄電池 全負荷 特定負荷 違い", secondary: ["蓄電池 ハイブリッド 単機能 違い"], intent: "蓄電池の種類の違いを知って、どれにするか決めたい", role: "種類の違いの詳しい解説。「蓄電池 選び方」全般は /battery が受ける", must: ["蓄電池", "全負荷", "特定負荷"], index: true },
  { path: "/guide/blackout", primary: "太陽光 停電時", secondary: ["蓄電池 停電", "葛飾区 水害 停電 備え"], intent: "停電のときに何が使えるかを知りたい", role: "停電時の使い方と備え", must: ["停電"], index: true },
  { path: "/guide/selling-electricity", primary: "太陽光 売電 価格", secondary: ["FIT 2026 価格", "出力制御 東京電力 住宅"], intent: "売電の仕組みと今年度の単価を知りたい", role: "売電とFITの正本", must: ["売電"], index: true },
  { path: "/guide/post-fit", primary: "卒FIT どうする", secondary: [], intent: "FITが終わったあとの選択肢を知りたい", role: "卒FIT後の選択肢", must: ["卒FIT"], index: true },
  { path: "/guide/all-electric", primary: "オール電化 太陽光 相性", secondary: [], intent: "オール電化の家に太陽光・蓄電池が合うかを知りたい", role: "オール電化との組み合わせ", must: ["オール電化"], index: true },
  { path: "/guide/roof-conditions", primary: "太陽光 屋根 条件", secondary: [], intent: "わが家の屋根に載せられるかを知りたい", role: "屋根条件の見方", must: ["屋根"], index: true },
  { path: "/guide/maintenance", primary: "太陽光 メンテナンス", secondary: [], intent: "設置後に必要な点検を知りたい", role: "点検と維持の考え方", must: ["メンテナンス"], index: true },
  { path: "/glossary", primary: "太陽光 蓄電池 用語集", secondary: ["太陽光 補助金 用語"], intent: "見積書や区の申請書類に出てくる言葉の意味を、短く確かめたい", role: "言葉の短い説明と、くわしいページへの入口。制度や機器の解説は、各ページに任せる", must: ["用語集"], index: true },
  { path: "/blog", primary: "SOLAR SHIFT ブログ", secondary: [], intent: "最新の記事を読みたい", role: "記事の一覧。個別の疑問（ロングテール）は記事が受ける", must: ["ブログ"], index: true },
  { path: "/company", primary: "株式会社サイプレス 太陽光", secondary: ["SOLAR SHIFT 運営会社"], intent: "運営会社がどこかを確かめたい", role: "会社情報の正本", must: ["運営会社"], index: true },
  { path: "/contact", primary: "SOLAR SHIFT 問い合わせ", secondary: ["葛飾区 太陽光 相談"], intent: "相談・見積もりを依頼したい", role: "問い合わせ窓口", must: ["お問い合わせ"], index: true },
  { path: "/editorial-policy", primary: "SOLAR SHIFT 編集方針", secondary: [], intent: "記事や補助金情報がどう作られているかを知りたい", role: "編集方針・自動生成記事の扱いの説明", must: ["編集方針"], index: true },
  { path: "/privacy", primary: "SOLAR SHIFT プライバシーポリシー", secondary: [], intent: "個人情報の扱いを確かめたい", role: "プライバシーポリシー", must: ["プライバシーポリシー"], index: true },
  { path: "/sitemap", primary: "SOLAR SHIFT サイトマップ", secondary: [], intent: "ページの一覧を見たい", role: "サイト内の案内", must: ["サイトマップ"], index: true },
];

export function getSeoEntry(path: string): SeoEntry | undefined {
  return SEO_MAP.find((e) => e.path === path);
}

/** 検索結果に出さないと決めている固定ページ（noindex・sitemap 対象外） */
export function isHeldBack(path: string): boolean {
  return SEO_MAP.some((e) => e.path === path && !e.index);
}

function tokens(s: string): string[] {
  return String(s)
    .replace(/[　]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** バイグラムの Dice 係数（記号・空白を除く） */
function dice(a: string, b: string): number {
  const grams = (s: string) => {
    const t = String(s).replace(/[\s　「」『』（）()・、。！？!?｜|：:【】]/g, "");
    const out = new Set<string>();
    for (let i = 0; i < t.length - 1; i += 1) out.add(t.slice(i, i + 2));
    return out;
  };
  const A = grams(a);
  const B = grams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  for (const g of A) if (B.has(g)) hit += 1;
  return (2 * hit) / (A.size + B.size);
}

export interface CannibalHit {
  path: string;
  keyword: string;
  reason: string;
}

/**
 * 記事の検索意図（スペース区切りのキーワード）が、固定ページのキーワードと取り合いにならないかを調べる。
 *
 * 取り合いとみなす条件（どちらか）
 *   A. 固定ページのキーワードの語を全部含み、記事側の追加の語が1つ以下
 *      例：固定「葛飾区 太陽光 補助金」 × 記事「葛飾区 太陽光 補助金」→ 取り合い
 *          固定「葛飾区 太陽光 業者」   × 記事「葛飾区 太陽光 業者 選び方」→ 取り合い（追加1語では絞れていない）
 *          固定「葛飾区 太陽光 補助金」 × 記事「葛飾区 太陽光 補助金 年度末 申請 間に合う」→ ロングテールなので可
 *   B. 文字の並びがほぼ同じ（Dice 係数 0.8 以上）
 *
 * 「よくある質問」のような一般語だけのキーワードで誤検知しないよう、SOLAR SHIFT を含むキーワードと
 * 1語だけのキーワードは対象から外す。
 */
export function findCannibalPage(intent: string): CannibalHit | null {
  const it = tokens(intent);
  if (it.length === 0) return null;
  for (const e of SEO_MAP) {
    for (const kw of [e.primary, ...e.secondary]) {
      if (kw.includes("SOLAR SHIFT")) continue;
      const kt = tokens(kw);
      if (kt.length < 2) continue;
      const contains = kt.every((k) => it.some((t) => t === k || t.includes(k)));
      if (contains) {
        const extra = it.filter((t) => !kt.some((k) => t === k || t.includes(k))).length;
        if (extra <= 1) return { path: e.path, keyword: kw, reason: `固定ページ ${e.path} のキーワード「${kw}」とほぼ同じ検索意図です（追加の語が${extra}つ）` };
      }
      if (dice(intent, kw) >= 0.8) return { path: e.path, keyword: kw, reason: `固定ページ ${e.path} のキーワード「${kw}」と文字の並びがほぼ同じです` };
    }
  }
  return null;
}

/** 主キーワードの重複（マップ自体の誤り）を返す。空なら問題なし */
export function duplicatedPrimaries(): string[] {
  const seen = new Map<string, string>();
  const out: string[] = [];
  for (const e of SEO_MAP) {
    for (const kw of [e.primary, ...e.secondary]) {
      const key = tokens(kw).sort().join(" ");
      const prev = seen.get(key);
      if (prev && prev !== e.path) out.push(`「${kw}」が ${prev} と ${e.path} で重複`);
      else seen.set(key, e.path);
    }
  }
  return out;
}
