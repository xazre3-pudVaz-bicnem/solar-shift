import Image from "next/image";
import { images } from "@/data/images";
import { reveal } from "@/lib/reveal";

/**
 * 「電気を買う暮らし」→「つくって、ためる暮らし」の図解（BEFORE / AFTER）。
 * 点線が流れるアニメーションで電気の向きを示す。削減額などの数値は出さない
 * （住宅・使用量・料金プランで変わるため。試算は現地調査のうえで個別に行う）。
 *
 * 幅の設計：3つの丸＋2本の矢印を横に並べるので、320px幅の端末でも収まるように
 * 400px未満では丸と余白を一段小さくする（固定幅のままだと375px幅で横スクロールが出る）。
 * 補足の文言は文節ごとの配列で渡し、文節の途中では折り返さない。
 */
function Node({ children, label, sub, tone }: { children: React.ReactNode; label: string; sub: string[]; tone: "gray" | "orange" | "green" | "navy" }) {
  const ring = { gray: "border-line-2 bg-white", orange: "border-orange-300 bg-white", green: "border-navy-200 bg-white", navy: "border-navy-100 bg-white" }[tone];
  const pill = { gray: "bg-ink-3 text-white", orange: "bg-orange-500 text-navy-900", green: "bg-navy-900 text-white", navy: "bg-navy-700 text-white" }[tone];
  return (
    <div className="flex w-[4.4rem] shrink-0 flex-col items-center text-center min-[400px]:w-[5.5rem] sm:w-28">
      <div className={`flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border-2 min-[400px]:h-[4.5rem] min-[400px]:w-[4.5rem] sm:h-24 sm:w-24 ${ring}`}>{children}</div>
      <span className={`mt-2 inline-block rounded-full px-3 py-[2px] font-heading text-[12px] font-bold whitespace-nowrap sm:text-[13px] ${pill}`}>{label}</span>
      <span className="mt-1 text-[11px] leading-[1.5] text-ink-2 sm:text-[12px]">
        {sub.map((part) => (
          <span key={part} className="inline-block">
            {part}
          </span>
        ))}
      </span>
    </div>
  );
}

/** 丸の中心の高さに合わせた、流れる点線（丸の大きさに応じて位置を変える） */
function Flow({ className }: { className: string }) {
  return <div className={`flow-x mt-[1.7rem] shrink-0 min-[400px]:mt-[2.06rem] sm:mt-[2.8rem] ${className}`} aria-hidden="true" />;
}

const ICON = "h-10 w-10 min-[400px]:h-12 min-[400px]:w-12 sm:h-16 sm:w-16";
const GLYPH = "h-8 w-8 min-[400px]:h-9 min-[400px]:w-9 sm:h-12 sm:w-12";

const Pylon = () => (
  <svg className={`${GLYPH} text-ink-3`} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M24 4 14 44M24 4l10 40M17 14h14M12 22h24M8 22v5M40 22v5M16.5 32h15M19 24l10 8M29 24l-10 8" />
  </svg>
);
const House = () => (
  <svg className={`${GLYPH} text-ink-3`} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 22 24 7l18 15M11 19v21h26V19M20 40V28h8v12" />
  </svg>
);

export function EnergyFlowFigure() {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.45fr]">
      {/* BEFORE */}
      <div className="min-w-0 rounded-lg bg-paper-3 p-4 min-[400px]:p-5 sm:p-7" {...reveal(0, "left")}>
        <p>
          <span className="inline-block rounded-full bg-ink-3 px-4 py-1 font-heading text-[13px] font-bold text-white">これまで</span>
        </p>
        <p className="mt-3 font-heading text-[20px] leading-[1.4] font-black text-ink-2 sm:text-[24px]">電気を買って、使うだけ</p>
        <div className="mt-6 flex items-start justify-center gap-2 sm:gap-3">
          <Node label="買う" sub={["電力会社から"]} tone="gray">
            <Pylon />
          </Node>
          <Flow className="w-10 text-ink-3 sm:w-16" />
          <Node label="使う" sub={["家の電気", "ぜんぶ"]} tone="gray">
            <House />
          </Node>
        </div>
        <p className="mt-5 text-[13px] leading-[1.8] text-ink-2">使う電気はすべて電力会社から。電気料金が変われば、その影響をそのまま受けます。停電時は電気が使えません。</p>
      </div>

      {/* 矢印 */}
      <div className="flex items-center justify-center py-1" aria-hidden="true">
        <span className="flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-orange-500 text-navy-950 lg:rotate-0">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* AFTER */}
      <div className="min-w-0 rounded-lg border-2 border-orange-500 bg-white p-4 min-[400px]:p-5 sm:p-7" {...reveal(150, "right")}>
        <p>
          <span className="inline-block rounded-full bg-orange-500 px-4 py-1 font-heading text-[13px] font-bold text-navy-900">これから</span>
        </p>
        <p className="mt-3 font-heading text-[20px] leading-[1.4] font-black text-navy-900 sm:text-[24px]">
          <span className="marker">つくる・ためる・使う・売る</span>
        </p>
        <div className="mt-6 flex items-start justify-center gap-0.5 min-[400px]:gap-1 sm:gap-3">
          <Node label="つくる" sub={["屋根の", "太陽光で"]} tone="orange">
            <Image src={images.iconSunPanel.src} alt="" width={80} height={80} className={ICON} />
          </Node>
          <Flow className="w-3 text-orange-500 min-[400px]:w-5 sm:w-12" />
          <Node label="使う" sub={["まず自宅の", "家電に"]} tone="navy">
            <Image src={images.iconHouseSolar.src} alt="" width={80} height={80} className={ICON} />
          </Node>
          <Flow className="w-3 text-navy-500 min-[400px]:w-5 sm:w-12" />
          <Node label="ためる" sub={["余りは", "蓄電池へ"]} tone="green">
            <Image src={images.iconHouseBattery.src} alt="" width={80} height={80} className={ICON} />
          </Node>
        </div>
        <ul className="mt-5 grid gap-2 text-[13px] leading-[1.7] sm:grid-cols-3">
          <li className="rounded-xl bg-orange-50 px-3 py-2">
            <strong className="block text-navy-900">昼</strong>発電した電気をそのまま使う
          </li>
          <li className="rounded-xl bg-navy-50 px-3 py-2">
            <strong className="block text-navy-900">夜</strong>ためた電気で買う量を減らす
          </li>
          <li className="rounded-xl bg-paper-2 px-3 py-2">
            <strong className="block text-navy-900">停電時</strong>最低限の電気を自宅で確保
          </li>
        </ul>
        <p className="mt-3 text-[12px] leading-[1.7] text-ink-3">それでも余った電気は売電に回せます。どれだけ減らせるかは、屋根・電気の使い方・料金プランで変わります。</p>
      </div>
    </div>
  );
}
