import technicianData from "./data/technician-2022-2026.json";
import generalData from "./data/general-2023-2027.json";
import extraData from "./data/extra-2024-2028.json";
import technicianSyllabus from "./data/technician-2022-2026-syllabus.json";
import generalSyllabus from "./data/general-2023-2027-syllabus.json";
import extraSyllabus from "./data/extra-2024-2028-syllabus.json";
export const POOL_LABELS = {
    technician: "Technician",
    general: "General",
    extra: "Extra",
};
const SYLLABUS = {
    technician: technicianSyllabus,
    general: generalSyllabus,
    extra: extraSyllabus,
};
const RAW_DATA = {
    technician: technicianData,
    general: generalData,
    extra: extraData,
};
export function getSubelements(pool) {
    return Object.keys(SYLLABUS[pool].subelements);
}
export function getSubelementMeta(pool, subelement) {
    return SYLLABUS[pool].subelements[subelement];
}
export function getQuestionCountBySubelement(pool, subelement) {
    return RAW_DATA[pool].filter((q) => q.id.startsWith(subelement)).length;
}
