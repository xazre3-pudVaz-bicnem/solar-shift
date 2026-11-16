import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { supervisor, supervisorPublished, SUPERVISOR_PATH } from "@/data/supervisor";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPageSchema, supervisorPersonSchema } from "@/lib/schema";

/**
 * 監修者のページ。中身は data/supervisor.ts（ご本人に確認した内容だけ）。
 * 確認が済むまで（supervisorPublished() が false の間）は 404 にする。メニュー・sitemap にも出さない。
 */
export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  if (!supervisorPublished()) return { robots: { index: false, follow: false } };
  return buildMetadata({
    title: `監修者 ${supervisor.name}｜${supervisor.jobTitle}`,
    description: `${siteConfig.name}の補助金・ガイドの記事を監修する${supervisor.name}（${supervisor.jobTitle}）の経歴・資格・監修の範囲。`,
    path: SUPERVISOR_PATH,
  });
}

export default function SupervisorPage() {
  if (!supervisorPublished()) notFound();
  const person = supervisorPersonSchema();
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "ホーム", href: "/" },
          { name: "運営会社", href: "/company" },
          { name: "監修者", href: SUPERVISOR_PATH },
        ]}
        eyebrow="監修者"
        title={supervisor.name}
        lead={`${supervisor.jobTitle}。${supervisor.scope}`}
      />
      <Container size="prose" className="prose-ss py-10 sm:py-14">
        <DefinitionList
          rows={[
            { term: "氏名", description: supervisor.name },
            { term: "肩書き", description: supervisor.jobTitle },
            { term: "監修の範囲", description: supervisor.scope },
          ]}
        />
        <h2>経歴</h2>
        <ul>
          {supervisor.career.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {supervisor.qualifications.length > 0 && (
          <>
            <h2>資格</h2>
            <ul>
              {supervisor.qualifications.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        {supervisor.achievements.length > 0 && (
          <>
            <h2>実績</h2>
            <ul>
              {supervisor.achievements.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </>
        )}
        <p>
          記事の作り方と確認のしかたは<Link href={siteConfig.editorial.policyPath}>編集方針</Link>、運営会社の情報は<Link href="/company">運営会社</Link>をご覧ください。
        </p>
      </Container>
      <JsonLd data={graph(webPageSchema({ path: SUPERVISOR_PATH, type: "AboutPage", name: `監修者 ${supervisor.name}`, description: supervisor.scope }), ...(person ? [person] : []))} />
    </>
  );
}
