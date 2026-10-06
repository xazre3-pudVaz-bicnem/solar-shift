/**
 * サイト全体の基本情報（NAP・運営会社・連絡先）を一元管理する。
 *
 * - 電話番号・LINE・営業時間など「まだ決まっていない」ものは空文字 / null のままにする。
 *   空の項目は UI にも構造化データにも出力されない（出力側で必ず空チェックする）。
 * - 会社情報は株式会社サイプレスのコーポレートサイト（cypress-all.co.jp）に掲載されている
 *   公式情報と、運営者から直接連絡を受けた内容だけを転記している。不明な項目は推測せず空にしてある。
 * - 所在地・郵便番号・電話番号・メールは 2026-10-02 に運営者から連絡を受けた内容。
 *   町名は文章にも出るので、変えるときは docs/VERIFIED_FACTS.md も一緒に直す
 *   （ページの文章は address.town / address.locality を参照しているので自動で変わる）。
 * - 対応エリアの定義は data/areas.ts にある（ここでは参照のみ）。
 */

export const siteConfig = {
  /** サービス名 */
  name: "SOLAR SHIFT",
  nameJa: "ソーラーシフト",
  /** 1行で言い切るサービス定義（Organization.description などに使用） */
  tagline: "葛飾区の太陽光発電・蓄電池・V2H",
  description:
    "SOLAR SHIFT（ソーラーシフト）は、東京都葛飾区を中心に住宅用太陽光発電・家庭用蓄電池・V2H・HEMSの導入と補助金活用をサポートするサービスです。株式会社サイプレスが運営しています。",
  /**
   * 本番ドメイン（2026-10-02 に運営者から連絡）。
   * canonical・OG・sitemap.xml・robots.txt・RSS・構造化データの URL は、すべてここから作る。
   * ドメインを変えるときは、ここだけを直す（ページやコンポーネントに URL を直接書かない）。
   * 実際にどの URL が使われるかは next.config.ts が決める：
   *   - 環境変数 NEXT_PUBLIC_SITE_URL があれば、それを優先
   *   - 無ければ、Vercel の本番デプロイのときだけ、この productionUrl を使う
   *   - プレビューや手元のビルドでは使わない（全ページ noindex になり、検索結果に出ない）
   */
  productionUrl: "https://www.solarshift.jp",
  /** 主要対応エリア（Local SEO の軸。data/areas.ts と一致させる） */
  primaryArea: {
    name: "葛飾区",
    prefecture: "東京都",
  },
  /** ブランドの一言メッセージ（ヒーローなどで使用） */
  brandStatement: {
    lead: "電気を買う暮らしから、\nつくって、ためる暮らしへ。",
    sub: "葛飾区の太陽光発電・蓄電池なら SOLAR SHIFT",
  },

  /** 運営会社（コーポレートサイトで公開されている情報のみ） */
  company: {
    name: "株式会社サイプレス",
    nameEn: "Cypress Inc.",
    representative: "織田 春樹",
    representativeTitle: "代表取締役",
    founded: "2026年5月13日",
    address: {
      postalCode: "125-0061",
      prefecture: "東京都",
      city: "葛飾区",
      /** 町名。「拠点は葛飾区◯◯」のような文章に使う */
      town: "亀有",
      street: "亀有3丁目16-14",
      /** 表示用のフル住所 */
      get full() {
        return `${this.prefecture}${this.city}${this.street}`;
      },
      /** 町名までの表記（例：東京都葛飾区亀有） */
      get locality() {
        return `${this.prefecture}${this.city}${this.town}`;
      },
    },
    /** コーポレートサイトに掲載されている代表メールアドレス */
    email: "info@cypress-all.co.jp",
    corporateUrl: "https://cypress-all.co.jp",
    /** 法人番号・許認可など未確認のものは null（画面に出さない） */
    corporateNumber: null as string | null,
    businessDescription:
      "Webマーケティング支援、MEO対策、SEO対策、AIO対策、ホームページ制作、SNS運用、AI活用支援、太陽光発電・蓄電池事業（SOLAR SHIFT）",
  },

  /**
   * SOLAR SHIFT の連絡先。
   * 営業時間は 2026-10-05 に運営者から連絡があった（9:00〜20:00）。定休日なしは 2026-10-06 に連絡があった。
   * LINE は未確定のため空。空のものは UI 側で非表示になり、チャットの回答でも案内しない（lib/chat/guard.ts が見ている）。
   */
  contact: {
    /** tel: リンク用（数字のみ） */
    tel: "09023600052",
    /** 画面に出す表記 */
    telDisplay: "090-2360-0052",
    lineUrl: "",
    /** 空の場合は company.email にフォールバックする */
    email: "info@cypress-all.co.jp",
    /** 営業時間（時刻の範囲だけを書く。例: "9:00〜20:00"）。電話番号の横に「（営業時間 9:00〜20:00）」の形で出る */
    hours: "9:00〜20:00",
    /**
     * 営業する曜日・定休日の表記（例: "定休日なし"、"月〜土（日曜・祝日は休み）"）。電話番号の横に「・定休日なし」の形で出る。
     * 空の間は、画面にもチャットにも曜日を出さない
     */
    businessDays: "定休日なし",
    /**
     * 営業する曜日（schema.org の曜日名）。構造化データの openingHoursSpecification に、hours の時刻と組み合わせて出す。
     * 空の間は、構造化データに営業時間を出さない（曜日の無い営業時間は書けないため）。
     * 年末年始などの休みは未確認なので、ここでは扱わない
     */
    openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as string[],
    /** 問い合わせフォームの送信先（Resend 設定時に使用。未設定ならフォームは案内のみ） */
    formNote: "フォーム送信後、内容を確認のうえ、担当者よりご連絡します。",
  },

  /**
   * Googleビジネスプロフィール連携用（取得後に記入）。
   * - mapsUrl  … プロフィールの共有リンク。入れると「Googleマップで見る」のリンク先がプロフィールになる
   * - embedUrl … プロフィールを開いて「共有 → 地図を埋め込む」で出る iframe の src
   *              （https://www.google.com/maps/embed?pb=... の形）。入れると運営会社ページに地図が出る。
   *   住所の文字列だけで地図を埋め込むと、その建物の名称（SOLAR SHIFT ではない名前）のカードが
   *   地図の上に表示されてしまう。そのため、プロフィールの URL が入るまでは地図を埋め込まない。
   * - reviewUrl … 口コミ投稿ページの URL
   */
  gbp: {
    placeId: "",
    mapsUrl: "",
    embedUrl: "",
    reviewUrl: "",
  },

  social: {
    instagram: "",
    x: "",
    youtube: "",
  },

  /**
   * 信頼性に関わる情報（施工体制・保証・保険・資格など）。
   * 証憑（契約書・保険証券・資格者証・メーカーの認定書など）を確認できたものだけを記入する。
   * null の項目は、画面にも構造化データにも出ない（components/ui/TrustFacts.tsx が見ている）。
   * 推測や「たぶんそうだろう」で埋めないこと。
   *   記入例  construction: "提携する施工会社が施工します（◯◯株式会社・葛飾区）"
   *           warranty: "工事保証◯年（施工に起因する雨漏りなど）。機器の保証はメーカーの保証書のとおり"
   *           qualifications: "第二種電気工事士 ◯名"
   */
  trust: {
    /** 施工体制（自社で施工するのか、提携する施工会社なのか） */
    construction: null as string | null,
    /** 施工会社（名称を出す場合は、先方の許可を得る） */
    contractor: null as string | null,
    /** 建設業許可・電気工事業の登録などの許認可（番号まで） */
    licenses: null as string | null,
    /** 有資格者（資格名と人数） */
    qualifications: null as string | null,
    /** メーカーの施工ID・認定（メーカー名と種類） */
    manufacturerCertifications: null as string | null,
    /** 保証（工事保証の年数と範囲。機器の保証はメーカーごと） */
    warranty: null as string | null,
    /** 工事保険（加入している保険の種類） */
    insurance: null as string | null,
    /** 導入後のサポート（点検の頻度・窓口） */
    afterSupport: null as string | null,
  },

  /**
   * サイトの文章を最後に見直した日（sitemap.xml の lastmod に使う）。
   * 全体に関わる修正をしたら更新する。
   */
  contentUpdatedAt: "2026-10-02",

  /** 補助金情報の基準日。制度を更新したら data/subsidies 側の lastVerified と合わせて更新する */
  subsidyInfoDate: "2026-10-01",

  /** 記事・補助金情報の「編集・運営」の表記（「監修」とは書かない。資格のある第三者の監修ではないため） */
  editorial: {
    supervisor: "SOLAR SHIFT / 株式会社サイプレス",
    policyPath: "/editorial-policy",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * 所在地の Google マップへのリンク。
 * Googleビジネスプロフィールの URL（gbp.mapsUrl）があればそれを、無ければ住所での検索 URL を返す。
 * 緯度経度は確認できていないので使わない。
 */
export function companyMapUrl(): string {
  if (siteConfig.gbp.mapsUrl) return siteConfig.gbp.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.company.address.full)}`;
}

/** 郵便番号つきの所在地（例：〒125-0061 東京都葛飾区亀有3丁目16-14）。郵便番号が空なら住所だけ */
export function addressWithPostal(): string {
  const a = siteConfig.company.address;
  return a.postalCode ? `〒${a.postalCode} ${a.full}` : a.full;
}

/** 構造化データ用の電話番号（国番号つき。例：+81-90-2360-0052）。未設定なら空文字 */
export function contactTelIntl(): string {
  const display: string = siteConfig.contact.telDisplay;
  return display ? `+81-${display.replace(/^0/, "")}` : "";
}

/** 運営会社ページに埋め込む地図の URL。Googleマップの埋め込み用 URL の形をしているときだけ返す */
export function companyMapEmbedUrl(): string {
  const url: string = siteConfig.gbp.embedUrl;
  return /^https:\/\/www\.google\.com\/maps\/embed\?/.test(url) ? url : "";
}

/** 連絡先メール（SOLAR SHIFT 専用が未設定なら会社代表メール） */
export function contactEmail(): string {
  return siteConfig.contact.email || siteConfig.company.email;
}
