/**
 * サイト全体の基本情報（NAP・運営会社・連絡先）を一元管理する。
 *
 * - 電話番号・LINE・営業時間など「まだ決まっていない」ものは空文字 / null のままにする。
 *   空の項目は UI にも構造化データにも出力されない（出力側で必ず空チェックする）。
 * - 会社情報は株式会社サイプレスのコーポレートサイト（cypress-all.co.jp）に掲載されている
 *   公式情報のみを転記している。不明な項目は推測せず null にしてある。
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
      /** 郵便番号は公式情報で未確認のため空にしている（確認後に記入） */
      postalCode: "",
      prefecture: "東京都",
      city: "葛飾区",
      street: "白鳥4-6-1-623",
      /** 表示用のフル住所 */
      get full() {
        return `${this.prefecture}${this.city}${this.street}`;
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
   * 電話・LINE・営業時間は未確定のため空。空のときは UI 側で非表示になる。
   */
  contact: {
    tel: "",
    telDisplay: "",
    lineUrl: "",
    /** 空の場合は company.email にフォールバックする */
    email: "",
    hours: "",
    /** 問い合わせフォームの送信先（Resend 設定時に使用。未設定ならフォームは案内のみ） */
    formNote: "フォーム送信後、通常2〜3営業日以内に担当者よりご連絡します。",
  },

  /** Googleビジネスプロフィール連携用（取得後に記入） */
  gbp: {
    placeId: "",
    mapsUrl: "",
    reviewUrl: "",
  },

  social: {
    instagram: "",
    x: "",
    youtube: "",
  },

  /** 補助金情報の基準日。制度を更新したら data/subsidies 側の lastVerified と合わせて更新する */
  subsidyInfoDate: "2026-10-01",

  /** 記事・補助金情報の監修表記 */
  editorial: {
    supervisor: "SOLAR SHIFT / 株式会社サイプレス",
    policyPath: "/editorial-policy",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** 連絡先メール（SOLAR SHIFT 専用が未設定なら会社代表メール） */
export function contactEmail(): string {
  return siteConfig.contact.email || siteConfig.company.email;
}
