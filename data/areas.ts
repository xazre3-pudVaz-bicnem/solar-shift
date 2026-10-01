/**
 * 対応エリアの定義。
 * - status: "primary"   … 主要対応エリア（専用ページあり）
 *           "secondary" … 周辺対応エリア（専用ページは独自コンテンツが揃ってから）
 *           "planned"   … 対応予定・要確認（対応可能と確定するまで「対応エリア」と断定しない）
 * - 専用ページを作るときは page に独自コンテンツ（補助金・住宅事情・災害リスク・FAQ）を必ず入れる。
 *   地域名を置換しただけのページは作らない（薄い地域ページの量産は禁止）。
 */

export type AreaStatus = "primary" | "secondary" | "planned";

export interface AreaFaq {
  q: string;
  a: string;
}

export interface AreaPage {
  /** そのエリア固有の導入文（結論） */
  lead: string;
  /** 自治体の補助金制度の id（data/subsidies の programId） */
  subsidyProgramIds: string[];
  /** 住宅事情・屋根事情 */
  housing: { title: string; body: string }[];
  /** 災害リスクと停電対策 */
  disaster: { title: string; body: string; sourceName?: string; sourceUrl?: string }[];
  /** 自治体公式情報へのリンク */
  officialLinks: { name: string; url: string }[];
  /** 地域特化FAQ */
  faq: AreaFaq[];
  /** 対応エリアの町名（表示用。網羅ではなく代表例） */
  towns?: string[];
}

export interface Area {
  slug: string;
  name: string;
  prefecture: string;
  status: AreaStatus;
  /** 一覧での短い説明 */
  summary: string;
  page?: AreaPage;
}

export const areas: Area[] = [
  {
    slug: "katsushika",
    name: "葛飾区",
    prefecture: "東京都",
    status: "primary",
    summary: "SOLAR SHIFT の拠点がある主要対応エリア。かつしかエコ助成金と東京都の助成を踏まえた提案を行います。",
    page: {
      lead:
        "葛飾区で太陽光発電・蓄電池を導入する場合、区の「かつしかエコ助成金」と東京都の助成制度の両方を検討対象にできます。区の制度は工事着工4週間前までの事前協議が原則必要で、申請の順番を間違えると対象外になるため、計画段階からの逆算が重要です。SOLAR SHIFT は葛飾区白鳥を拠点に、区内の住宅事情に合わせた提案を行います。",
      subsidyProgramIds: ["katsushika-eco-r8", "tokyo-solar-r8", "tokyo-battery-r8"],
      housing: [
        {
          title: "戸建の密集した住宅地が多い",
          body: "葛飾区は約47万人・約26万世帯（2026年4月1日時点、葛飾区公式サイト）が暮らす住宅都市です。駅から離れた地域を中心に戸建住宅が多く、隣家との距離が近い敷地も珍しくありません。隣接する建物による影の影響を現地で確認したうえで、パネルの配置と期待発電量を見積もることが大切です。",
        },
        {
          title: "屋根の形状・向きは1軒ごとに違う",
          body: "切妻・寄棟・片流れ・陸屋根など屋根の形状によって、載せられる容量や工法が変わります。東京都の助成では陸屋根の架台設置や防水工事に追加の助成メニューがあるため、屋根条件によって使える制度も変わります。",
        },
        {
          title: "築年数と屋根材の確認",
          body: "築年数が経った住宅では、太陽光パネルを載せる前に屋根材の状態や下地の確認が必要です。葺き替えや補修の時期と合わせて検討すると、二度手間や余計な費用を避けられます。",
        },
      ],
      disaster: [
        {
          title: "区の半分近くが海抜ゼロメートル地帯",
          body: "葛飾区は荒川・中川・江戸川・新中川といった大きな河川に囲まれ、区の半分近くが東京湾の海面より低いゼロメートル地帯です。区は令和7年3月に水害ハザードマップを更新し、電柱に浸水深を示す洪水標識板を設置しています。",
          sourceName: "葛飾区公式サイト「葛飾区水害ハザードマップ（令和7年3月発行）」",
          sourceUrl: "https://www.city.katsushika.lg.jp/kurashi/1004028/1000063/1004031/1022522.html",
        },
        {
          title: "蓄電池・V2Hの設置場所は浸水想定を踏まえて",
          body: "水害リスクのある地域では、蓄電池やパワーコンディショナの設置高さ・設置場所が重要です。ハザードマップの浸水想定深を確認し、可能な範囲で高い位置への設置を検討します。停電時に太陽光と蓄電池で最低限の電力を確保できることは、在宅避難の備えにもなります。",
        },
      ],
      officialLinks: [
        {
          name: "令和8年度《個人住宅用》かつしかエコ助成金のご案内（葛飾区）",
          url: "https://www.city.katsushika.lg.jp/kurashi/1000062/1023018/1035385/1030818.html",
        },
        {
          name: "葛飾区水害ハザードマップ（葛飾区）",
          url: "https://www.city.katsushika.lg.jp/kurashi/1004028/1000063/1004031/1022522.html",
        },
        {
          name: "葛飾区の世帯と人口（葛飾区）",
          url: "https://www.city.katsushika.lg.jp/information/1000083/1005977/1038024/index.html",
        },
        {
          name: "令和8年度 家庭における太陽光発電導入促進事業（クール・ネット東京）",
          url: "https://www.tokyo-co2down.jp/subsidy/fam_solar/r8/",
        },
      ],
      faq: [
        {
          q: "葛飾区の太陽光補助金は、区と東京都の両方に申請できますか？",
          a: "区の公式案内には他制度との併用に関する明記がなく、東京都の案内は「都および公社の他の同種の助成金との重複不可」としています。区・都それぞれの窓口に、ご自宅の条件で確認することをおすすめします。SOLAR SHIFT でも申請の順番の整理をお手伝いします。",
        },
        {
          q: "葛飾区の助成金は、契約してから申請しても間に合いますか？",
          a: "かつしかエコ助成金は原則として工事着工の4週間前までに事前協議が必要です。区から事前協議回答書が届く前に工事を始めると対象外になります。契約の時期ではなく「着工の時期」から逆算してください。",
        },
        {
          q: "葛飾区内なら、どの地域でも現地調査に来てもらえますか？",
          a: "はい。葛飾区内は全域が主要対応エリアです。現地調査の日程はお問い合わせフォームからご相談ください。",
        },
        {
          q: "水害が心配な地域ですが、蓄電池を置いても大丈夫ですか？",
          a: "設置場所の浸水想定深を確認したうえで、屋内設置型や高い位置への設置など、機種と場所の選択で対策します。現地調査時にハザードマップと照らし合わせてご提案します。",
        },
      ],
      towns: [
        "白鳥", "お花茶屋", "亀有", "金町", "新宿", "柴又", "高砂", "立石", "青戸", "四つ木", "堀切", "東四つ木",
        "東立石", "奥戸", "細田", "鎌倉", "東水元", "水元", "南水元", "西水元", "東金町", "新小岩", "西新小岩", "東新小岩",
      ],
    },
  },
  {
    slug: "adachi",
    name: "足立区",
    prefecture: "東京都",
    status: "secondary",
    summary: "葛飾区に隣接する周辺対応エリア。足立区独自の助成制度の確認を含めてご相談いただけます。",
  },
  {
    slug: "edogawa",
    name: "江戸川区",
    prefecture: "東京都",
    status: "secondary",
    summary: "葛飾区に隣接する周辺対応エリア。江戸川区の助成制度の確認を含めてご相談いただけます。",
  },
  {
    slug: "sumida",
    name: "墨田区",
    prefecture: "東京都",
    status: "secondary",
    summary: "葛飾区の周辺対応エリア。墨田区の助成制度の確認を含めてご相談いただけます。",
  },
  {
    slug: "matsudo",
    name: "松戸市",
    prefecture: "千葉県",
    status: "planned",
    summary: "対応を検討中のエリアです。対応可能かどうかは個別にお問い合わせください。",
  },
];

export const primaryAreas = areas.filter((a) => a.status === "primary");
export const secondaryAreas = areas.filter((a) => a.status === "secondary");
export const plannedAreas = areas.filter((a) => a.status === "planned");
export const areasWithPage = areas.filter((a) => a.page);

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}

/** LocalBusiness.areaServed 用（対応と言い切れるエリアのみ） */
export function servedAreaNames(): string[] {
  return areas.filter((a) => a.status !== "planned").map((a) => `${a.prefecture}${a.name}`);
}
