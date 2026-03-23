import technicianData from "./data/technician-2022-2026.json";
import generalData from "./data/general-2023-2027.json";
import extraData from "./data/extra-2024-2028.json";

import technicianSyllabus from "./data/technician-2022-2026-syllabus.json";
import generalSyllabus from "./data/general-2023-2027-syllabus.json";
import extraSyllabus from "./data/extra-2024-2028-syllabus.json";

export type PoolId = "technician" | "general" | "extra";

export const POOL_LABELS: Record<PoolId, string> = {
  technician: "Technician",
  general: "General",
  extra: "Extra",
};

interface SubelementMeta {
  title: string;
  exam_questions: number;
  num_groups: number;
  total_questions: number;
  groups: Record<string, string>;
}

const SYLLABUS: Record<PoolId, { subelements: Record<string, SubelementMeta> }> = {
  technician: technicianSyllabus as any,
  general: generalSyllabus as any,
  extra: extraSyllabus as any,
};

const RAW_DATA: Record<PoolId, any[]> = {
  technician: technicianData as any[],
  general: generalData as any[],
  extra: extraData as any[],
};

export function getSubelements(pool: PoolId): string[] {
  return Object.keys(SYLLABUS[pool].subelements);
}

export function getSubelementMeta(pool: PoolId, subelement: string): SubelementMeta | undefined {
  return SYLLABUS[pool].subelements[subelement];
}

export function getQuestionCountBySubelement(pool: PoolId, subelement: string): number {
  return RAW_DATA[pool].filter((q: any) => (q.id as string).startsWith(subelement)).length;
}
