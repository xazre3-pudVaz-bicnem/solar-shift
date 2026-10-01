import { katsushikaProgram } from "./katsushika";
import { tokyoSolarProgram, tokyoBatteryProgram } from "./tokyo";
import { nationalPrograms } from "./national";
import type { Subsidy, SubsidyArea, SubsidyProgram, Equipment } from "./types";

export type {
  Subsidy,
  SubsidyArea,
  SubsidyProgram,
  Equipment,
  AmountRule,
  HousingType,
  SubsidyStatus,
} from "./types";

export const subsidyPrograms: SubsidyProgram[] = [
  katsushikaProgram,
  tokyoSolarProgram,
  tokyoBatteryProgram,
  ...nationalPrograms,
];

export const allSubsidies: Subsidy[] = subsidyPrograms.flatMap((p) => p.menus);

export function programsByArea(area: SubsidyArea): SubsidyProgram[] {
  return subsidyPrograms.filter((p) => p.area === area);
}

export function getProgram(id: string): SubsidyProgram | undefined {
  return subsidyPrograms.find((p) => p.id === id);
}

export function subsidiesByArea(area: SubsidyArea): Subsidy[] {
  return allSubsidies.filter((s) => s.area === area);
}

export function subsidiesByEquipment(equipment: Equipment): Subsidy[] {
  return allSubsidies.filter((s) => s.equipment === equipment);
}

export function getSubsidy(id: string): Subsidy | undefined {
  return allSubsidies.find((s) => s.id === id);
}

/** 全制度のうち最も古い確認日（「情報確認日」の表示に使う） */
export function oldestVerifiedDate(subsidies: Subsidy[] = allSubsidies): string {
  return subsidies.map((s) => s.lastVerified).sort()[0] ?? "";
}

export const areaLabel: Record<SubsidyArea, string> = {
  katsushika: "葛飾区",
  tokyo: "東京都",
  national: "国",
};

export const statusLabel: Record<Subsidy["status"], string> = {
  open: "受付中",
  closed: "受付終了",
  upcoming: "公募前",
  unknown: "要確認",
};

export const equipmentLabel: Record<Equipment, string> = {
  solar: "太陽光発電",
  battery: "蓄電池",
  v2h: "V2H",
  hems: "HEMS",
  "solar-battery-addon": "太陽光＋蓄電池 併設加算",
  "solar-hems-addon": "太陽光＋HEMS 併設加算",
  other: "その他",
};

export { katsushikaProgram, tokyoSolarProgram, tokyoBatteryProgram, nationalPrograms };
