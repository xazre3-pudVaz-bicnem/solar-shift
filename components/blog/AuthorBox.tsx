import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

/** 記事末尾の監修・運営表記（E-E-A-T）。 */
export function AuthorBox() {
  return (
    <aside className="flex gap-4 rounded-3xl border-2 border-green-200 bg-white p-5 shadow-card" aria-label="この記事の監修・運営">
      <Image src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0 bg-white object-contain p-1" />
      <div className="text-[14px] leading-[1.8] text-ink-2">
        <p className="font-bold text-navy-900">監修・運営：{siteConfig.editorial.supervisor}</p>
        <p className="mt-1">
          {siteConfig.company.address.full}の{siteConfig.company.name}が運営する、{siteConfig.primaryArea.name}の太陽光発電・蓄電池サービスです。補助金・制度に関する記述は、自治体・国の一次情報を確認したうえで掲載し、確認日を明記しています。
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          <Link href="/company" className="inline-block py-0.5 font-bold text-navy-600 underline underline-offset-4">運営会社</Link>
          <Link href={siteConfig.editorial.policyPath} className="inline-block py-0.5 font-bold text-navy-600 underline underline-offset-4">記事・補助金情報の編集方針</Link>
          <Link href="/contact" className="inline-block py-0.5 font-bold text-navy-600 underline underline-offset-4">お問い合わせ</Link>
        </p>
      </div>
    </aside>
  );
}
