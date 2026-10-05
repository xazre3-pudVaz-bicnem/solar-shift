/**
 * IndexNow：本番に出たページの更新を、Bing などの検索エンジンにすぐ知らせる。
 * ChatGPT の検索は Bing の索引を使うため、AI 検索に新しい内容が載るまでの時間も縮む。
 * Google は IndexNow に参加していない（Google には sitemap.xml と Search Console で知らせる）。
 *
 * どこから動くか
 *   .github/workflows/indexnow.yml が、Vercel の本番デプロイが終わったとき（GitHub の deployment_status が success）に呼ぶ。
 *   ブログのボットの push も Vercel がデプロイするので、同じ仕組みで知らせられる。
 *
 * 何を送るか（前回の本番デプロイからの変更で決める）
 *   - content/blog/*.md だけが変わった … その記事、/blog、記事のカテゴリとピラーのページ（sitemap.xml に載っているものだけ）
 *   - app・components・data・lib・content のほかのファイルも変わった … sitemap.xml の全 URL（ヘッダー・フッターなど全ページに効くため）
 *   - それ以外（docs・scripts・.github・public・README など）だけ … 何も送らない
 *
 * 鍵は public/<鍵>.txt（中身も同じ文字列）。IndexNow の仕組み上、公開してよい文字列。
 *
 * 手元で試す（--dry-run は送らずに表示だけ）：
 *   node scripts/indexnow.mjs --since <コミット> --dry-run
 *   node scripts/indexnow.mjs --all --dry-run
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE_ALL = args.includes("--all");
const SINCE = args.includes("--since") ? args[args.indexOf("--since") + 1] ?? "" : "";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const SITE_WIDE = /^(app|components|data|lib|content)\//;
const BLOG_POST = /^content\/blog\/[^/]+\.md$/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function git(...a) {
  return execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();
}

function siteUrl() {
  const src = fs.readFileSync(path.join(ROOT, "lib", "site.ts"), "utf8");
  const m = src.match(/productionUrl:\s*"(https:[^"]+)"/);
  if (!m) throw new Error("lib/site.ts に productionUrl が見つかりません");
  return m[1].replace(/\/+$/, "");
}

function indexNowKey() {
  const dir = path.join(ROOT, "public");
  const found = fs.readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (found.length !== 1) throw new Error(`public/ に IndexNow の鍵のファイルが ${found.length} 個あります（1個にしてください）`);
  const key = found[0].replace(/\.txt$/, "");
  if (fs.readFileSync(path.join(dir, found[0]), "utf8").trim() !== key) throw new Error(`public/${found[0]} の中身が、ファイル名と一致しません`);
  return key;
}

/** 前回の本番デプロイ（成功したもの）のコミット。GitHub の deployments API で探す */
async function previousProductionSha(currentId) {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token || !currentId) return "";
  const api = async (p) => {
    const res = await fetch(`https://api.github.com/repos/${repo}${p}`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${p}`);
    return res.json();
  };
  const list = await api("/deployments?environment=Production&per_page=50");
  const older = list.filter((d) => Number(d.id) < Number(currentId)).sort((a, b) => b.id - a.id);
  for (const d of older) {
    const statuses = await api(`/deployments/${d.id}/statuses?per_page=10`);
    // inactive は「一度 success になったあと、新しいデプロイに置き換わった」もの
    if (statuses.some((s) => s.state === "success" || s.state === "inactive")) return d.sha;
  }
  return "";
}

/** ファイルの中身（そのコミットに無ければ空） */
function fileAt(sha, file) {
  try {
    return git("show", `${sha}:${file}`);
  } catch {
    return "";
  }
}

function frontmatter(text, field) {
  const head = text.split(/^---\s*$/m)[1] ?? "";
  for (const line of head.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0 && line.slice(0, i) === field) return line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "solar-shift-indexnow" }, redirect: "follow" });
  return { status: res.status, text: res.ok ? await res.text() : "" };
}

async function liveSitemap(site) {
  const { status, text } = await fetchText(`${site}/sitemap.xml`);
  if (status !== 200) throw new Error(`sitemap.xml を読めません（${status}）`);
  return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** 本番に鍵のファイルが出ているか（デプロイ直後は数十秒待つことがある） */
async function waitForKey(site, key) {
  for (let i = 0; i < 12; i++) {
    const { status, text } = await fetchText(`${site}/${key}.txt`);
    if (status === 200 && text.trim() === key) return;
    await sleep(15_000);
  }
  throw new Error(`${site}/${key}.txt が本番で読めません（デプロイが終わっていないか、鍵のファイルが無い）`);
}

async function main() {
  const site = siteUrl();
  const key = indexNowKey();
  const host = new URL(site).host;
  const head = process.env.DEPLOY_SHA || git("rev-parse", "HEAD");

  let mode = "all";
  let base = "";
  let changed = [];
  if (!FORCE_ALL) {
    base = SINCE || (await previousProductionSha(process.env.DEPLOY_ID));
    if (!base) {
      console.log("前回の本番デプロイが見つからないため、sitemap.xml の全 URL を送ります。");
    } else {
      try {
        // --no-renames：名前を変えた記事は、古い URL も「消えた」として知らせる
        changed = git("diff", "--name-only", "--no-renames", base, head).split("\n").filter(Boolean);
        mode = "diff";
        console.log(`前回の本番デプロイ ${base.slice(0, 7)} から ${head.slice(0, 7)} までに変わったファイル：${changed.length} 件`);
      } catch {
        console.log(`コミット ${base.slice(0, 7)} を履歴で見つけられないため、sitemap.xml の全 URL を送ります。`);
      }
    }
  }

  if (!DRY_RUN) await waitForKey(site, key);
  const sitemap = await liveSitemap(site);
  const inSitemap = new Set(sitemap);

  let urls = [];
  if (mode === "all" || changed.some((f) => SITE_WIDE.test(f) && !BLOG_POST.test(f))) {
    urls = sitemap;
  } else {
    const posts = changed.filter((f) => BLOG_POST.test(f));
    if (posts.length === 0) {
      console.log("ページの中身に関わる変更が無いため、送りません。");
      return;
    }
    // removed：消した記事。sitemap.xml には無いが、検索エンジンが 404 を確かめて検索結果から外せるように送る
    // want：sitemap.xml に載っているものだけ送る（公開の条件を満たさない記事や、noindex のカテゴリは載らない）
    const removed = new Set();
    const want = new Set([`${site}/blog`]);
    for (const file of posts) {
      const now = fileAt(head, file);
      const text = now || fileAt(base, file);
      const slug = frontmatter(text, "slug") || path.basename(file, ".md").replace(/^\d{4}-\d{2}-\d{2}-/, "");
      const url = `${site}/blog/${slug}`;
      if (!now) {
        removed.add(url);
        continue;
      }
      if (!inSitemap.has(url)) console.log(`::warning::${url} が sitemap.xml にありません（公開されていない記事）。送りません。`);
      want.add(url);
      const category = frontmatter(now, "category");
      const pillar = frontmatter(now, "pillar");
      if (category) want.add(`${site}/blog/category/${category}`);
      if (pillar.startsWith("/")) want.add(`${site}${pillar}`);
    }
    urls = [...removed, ...[...want].filter((u) => inSitemap.has(u))];
  }

  urls = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });
  if (urls.length === 0) {
    console.log("送る URL がありません。");
    return;
  }
  console.log(`送る URL：${urls.length} 件`);
  for (const u of urls) console.log(`  ${u}`);
  if (DRY_RUN) {
    console.log("（--dry-run のため、送っていません）");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
  });
  const body = (await res.text()).slice(0, 300);
  // 200：受け付けた／202：受け付けた（鍵の確認はこれから）
  if (res.status === 200 || res.status === 202) {
    console.log(`IndexNow：${res.status} 受け付けられました。`);
    return;
  }
  throw new Error(`IndexNow：${res.status} ${body}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
