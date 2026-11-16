import { siteConfig } from "../lib/site";

/**
 * 監修者（/about/supervisor）。補助金とガイドの記事の「監修者」の欄、構造化データの Person・reviewedBy に使う。
 *
 * 載せるのは、ご本人に確認した内容だけ。確認が済むまでは published を false のままにする。
 * false の間は、監修者のページは 404、記事の監修者の欄と構造化データ（Person・reviewedBy）も出ない。
 *
 * TODO（ご本人に確認して、ここに入れる）
 *   - career        … 経歴（年・所属・役割。確かめられる事実だけ）
 *   - qualifications … 保有している資格（正式な名前。登録番号を載せるかどうか）
 *   - achievements  … 実績（件数などの数字は、裏付けの記録があるものだけ）
 *   - scope         … 監修の範囲（例：補助金・ガイドの記事の、制度と数字の確認）。実際に読んで確かめる運用にしてから書く
 *   - 顔写真を載せるかどうか
 * 入れ終わって、ご本人が文面を確認したら published を true にする（編集方針のページの文面も、監修ありの内容に切り替わる）。
 */
export interface Supervisor {
  published: boolean;
  name: string;
  /** 肩書き（会社名＋役職） */
  jobTitle: string;
  career: string[];
  qualifications: string[];
  achievements: string[];
  /** 監修の範囲（何を確かめているか） */
  scope: string;
}

export const supervisor: Supervisor = {
  published: false,
  name: siteConfig.company.representative,
  jobTitle: `${siteConfig.company.name} ${siteConfig.company.representativeTitle}`,
  career: [],
  qualifications: [],
  achievements: [],
  scope: "",
};

export const SUPERVISOR_PATH = "/about/supervisor";

/** 監修者を表に出してよいか（ご本人の確認が済み、経歴と監修の範囲が入っている） */
export function supervisorPublished(): boolean {
  return supervisor.published && supervisor.career.length > 0 && supervisor.scope.trim() !== "";
}
