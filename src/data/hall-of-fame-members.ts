import { memberPhotoUrl } from "@/data/member-photo-sources";

export type MemberGroup =
  | "JRB Leadership"
  | "State Revenue"
  | "Partner Agency"
  | "Needs verification";

export type MemberStatus =
  | "verified"
  | "name-pending"
  | "verification-required";

export type HallOfFameMember = {
  id: string;
  photoNumber: number;
  name: string;
  designation: string;
  organization: string;
  group: MemberGroup;
  status: MemberStatus;
  photoUrl: string;
  hasPhoto: boolean;
  birthdayCategory: string;
  updatedAt?: string;
};

function member(
  photoNumber: number,
  name: string,
  designation: string,
  organization: string,
  group: MemberGroup,
  _filename: string,
  status: MemberStatus = "verified"
): HallOfFameMember {
  const birthdayCategory =
    group === "JRB Leadership"
      ? "Board Member"
      : group === "Partner Agency"
        ? "External Partner"
        : "Stakeholder";

  return {
    id: `jrb-${String(photoNumber).padStart(2, "0")}`,
    photoNumber,
    name,
    designation,
    organization,
    group,
    status,
    photoUrl: memberPhotoUrl(photoNumber) || `/members/${_filename}`,
    hasPhoto: true,
    birthdayCategory,
  };
}

export const hallOfFameMembers: HallOfFameMember[] = [
  member(
    1,
    "Dr. Zacch Adedeji, PhD",
    "Chairman",
    "Joint Revenue Board",
    "JRB Leadership",
    "photo_01_zacch-adedeji.jpg"
  ),
  member(
    2,
    "Olusegun Adesokan",
    "Executive Secretary",
    "Joint Revenue Board",
    "JRB Leadership",
    "photo_02_olusegun-philip-adesokan.jpg"
  ),
  member(
    3,
    "Hamman Njabari",
    "Executive Chairman",
    "Adamawa State Internal Revenue Service",
    "State Revenue",
    "photo_03_hamman-adama-njabari.jpg"
  ),
  member(
    4,
    "Hamzat Subair",
    "Executive Chairman",
    "Lagos State Internal Revenue Service",
    "State Revenue",
    "photo_04_dr-hamzat-ayodele-subair.jpg"
  ),
  member(
    5,
    "Shade Omoniyi",
    "Executive Chairman",
    "Kwara State Internal Revenue Service",
    "State Revenue",
    "photo_05_shade-omoniyi.jpg"
  ),
  member(
    6,
    "Okon Okon",
    "Executive Chairman",
    "Akwa Ibom State Internal Revenue Service",
    "State Revenue",
    "photo_06_sir-okon-okon.jpg"
  ),
  member(
    7,
    "Solomon Ighrakpata",
    "Executive Chairman",
    "Delta State Internal Revenue Service",
    "State Revenue",
    "photo_07_hon-chief-solomon-ighrakpata.jpg"
  ),
  member(
    8,
    "Muazu Usman",
    "Executive Chairman",
    "Bauchi State Internal Revenue Service",
    "State Revenue",
    "photo_08_muazu-usman.jpg"
  ),
  member(
    9,
    "Olaniran Olatona",
    "Executive Chairman",
    "Ekiti State Internal Revenue Service",
    "State Revenue",
    "photo_09_mr-olaniran-olatona.jpg"
  ),
  member(
    10,
    "Ahmed Dodo",
    "Executive Chairman",
    "Zamfara State Internal Revenue Service",
    "State Revenue",
    "photo_10_ahmed-rakiya-dodo.jpg"
  ),
  member(
    11,
    "Michael Ango",
    "Executive Chairman",
    "Federal Capital Territory Internal Revenue Service",
    "State Revenue",
    "photo_11_mr-michael-ango.jpg"
  ),
  member(
    12,
    "Bayo Rojugbokan",
    "Executive Chairman",
    "Ondo State Internal Revenue Service",
    "State Revenue",
    "photo_12_bayo-rojugbokan.jpg"
  ),
  member(
    13,
    "Ibrahim Bello",
    "Executive Chairman",
    "Borno State Internal Revenue Service",
    "State Revenue",
    "photo_13_prof-ibrahim-bello-alhaji.jpg"
  ),
  member(
    14,
    "Suleiman Bakura",
    "Executive Chairman",
    "Yobe State Internal Revenue Service",
    "State Revenue",
    "photo_14_alhaji-suleiman-a-bakura.jpg"
  ),
  member(
    15,
    "Aminu Abdullahi",
    "Executive Chairman",
    "Kebbi State Internal Revenue Service",
    "State Revenue",
    "photo_15_aminu-abdullahi.jpg"
  ),
  member(
    16,
    "Innocent Ohagwa",
    "President/Chairman",
    "Chartered Institute of Taxation of Nigeria",
    "Partner Agency",
    "photo_16_innocent-chinyere-ohagwa-fcti.jpg"
  ),
  member(
    17,
    "Sule Enehe",
    "Executive Chairman",
    "Kogi State Internal Revenue Service",
    "State Revenue",
    "photo_17_sule-salihu-enehe.jpg"
  ),
  member(
    18,
    "Ibrahim Sarki",
    "Executive Chairman",
    "Nasarawa State Internal Revenue Service",
    "State Revenue",
    "photo_18_ibrahim-adamu-sarki.jpg"
  ),
  member(
    19,
    "Mohammed Isyaku",
    "Executive Chairman",
    "Katsina State Internal Revenue Service",
    "State Revenue",
    "photo_19_mallam-mohammed-isyaku.jpg"
  ),
  member(
    20,
    "Bashir Maitama",
    "Executive Chairman",
    "Kano State Internal Revenue Service",
    "State Revenue",
    "photo_20_bashir-maitama.jpg"
  ),
  member(
    21,
    "DCM Aliyu Datsama",
    "Representative",
    "Federal Road Safety Corps",
    "Partner Agency",
    "photo_21_dcm-aliyu-bawa-datsama.jpg"
  ),
  member(
    22,
    "Emmanuel Nnamani",
    "Executive Chairman",
    "Enugu State Internal Revenue Service",
    "State Revenue",
    "photo_22_mr-emmanuel-nnamani.jpg"
  ),
  member(
    23,
    "Odior Osirenimhe",
    "Executive Chairman",
    "Edo State Internal Revenue Service",
    "State Revenue",
    "photo_23_mr-odior-john-osirenimhe-fca-fcti.jpg"
  ),
  member(
    24,
    "Adebowale Awakan",
    "Executive Chairman",
    "Oyo State Internal Revenue Service",
    "State Revenue",
    "photo_24_mr-adebowale-olufemi-awakan.jpg"
  ),
  member(
    25,
    "Jerry Adams",
    "Executive Chairman",
    "Kaduna State Internal Revenue Service",
    "State Revenue",
    "photo_25_mr-jerry-adams.jpg"
  ),
  member(
    26,
    "Abolaji Akinola",
    "Representative",
    "National Identity Management Commission",
    "Partner Agency",
    "photo_26_abolaji-akinola.jpg"
  ),
  member(
    27,
    "Muhammad Etsu",
    "Executive Chairman",
    "Niger State Internal Revenue Service",
    "State Revenue",
    "photo_27_alhaji-muhammad-madami-etsu.jpg"
  ),
  member(
    28,
    "Uche Okoro",
    "Executive Chairman",
    "Abia State Internal Revenue Service",
    "State Revenue",
    "photo_28_uche-elekwachi-okoro.jpg"
  ),
  member(
    29,
    "Nasiru Idris",
    "Executive Chairman",
    "Jigawa State Internal Revenue Service",
    "State Revenue",
    "photo_29_dr-nasiru-sabo-idris.jpg"
  ),
  member(
    30,
    "Remigius Okoye",
    "Executive Chairman",
    "Imo State Internal Revenue Service",
    "State Revenue",
    "photo_30_remigius-justice-okoye.jpg"
  ),
  member(
    31,
    "Israel Egbunefu",
    "Executive Chairman",
    "Rivers State Internal Revenue Service",
    "State Revenue",
    "photo_31_sir-israel-onwuanaku-egbunefu.jpg"
  ),
  member(
    32,
    "Omo Christopher",
    "Executive Chairman",
    "Ebonyi State Internal Revenue Service",
    "State Revenue",
    "photo_32_omo-christopher.jpg"
  ),
  member(
    33,
    "Aisha Adamu",
    "Executive Chairman",
    "Gombe State Internal Revenue Service",
    "State Revenue",
    "photo_33_aisha-adamu.jpg"
  ),
  member(
    34,
    "Jim Wayas",
    "Executive Chairman",
    "Plateau State Internal Revenue Service",
    "State Revenue",
    "photo_34_dr-jim-pam-wayas.jpg"
  ),
  member(
    35,
    "Joseph Kwaghgba",
    "Executive Chairman",
    "Benue State Internal Revenue Service",
    "State Revenue",
    "photo_35_sunday-odagba.jpg"
  ),
  member(
    36,
    "Abubakar Zaki Tambuwal",
    "Executive Chairman",
    "Sokoto State Internal Revenue Service",
    "State Revenue",
    "photo_36_abubakar-zaki-tambuwal.jpg"
  ),
  member(
    37,
    "Bolaji Akintola",
    "Executive Director, M&T",
    "Nigeria Revenue Service",
    "Partner Agency",
    "photo_37_bolaji-akintola.jpg"
  ),
  member(
    38,
    "Olatunde Olaniyan",
    "Representative",
    "Nigeria Customs Service",
    "Partner Agency",
    "photo_38_olatunde-olaniyan.jpg"
  ),
  member(
    39,
    "Edwin Okon",
    "Executive Chairman",
    "Cross River State Internal Revenue Service",
    "State Revenue",
    "photo_39_prince-edwin-okon.jpg"
  ),
  member(
    40,
    "Daniel Eniekezimene",
    "Executive Chairman",
    "Bayelsa State Internal Revenue Service",
    "State Revenue",
    "photo_40_dr-daniel-esetebafa-eniekezimene.jpg"
  ),
  member(
    41,
    "Olugbenga Olaleye",
    "Executive Chairman",
    "Ogun State Internal Revenue Service",
    "State Revenue",
    "photo_41_olugbenga-anthony-olaleye.jpg"
  ),
  member(
    42,
    "Isiaka Hamisi",
    "Representative",
    "Revenue Mobilisation Allocation and Fiscal Commission",
    "Partner Agency",
    "photo_42_udodirim-okongwu.jpg"
  ),
  member(
    43,
    "Ikeazor Okonkwo",
    "Executive Chairman",
    "Anambra State Internal Revenue Service",
    "State Revenue",
    "photo_43_dr-greg-ugochukwu-ezeilo.jpg"
  ),
  member(
    44,
    "Jeremiah Faransa",
    "Executive Chairman",
    "Taraba State Internal Revenue Service",
    "State Revenue",
    "photo_44_brig-gen-jeremiah-aliyu-faransa-rtd.jpg"
  ),
  member(
    45,
    "DCG Saidu Daura",
    "Representative",
    "Nigeria Immigration Service",
    "Partner Agency",
    "photo_45_dci-stephen-moses-akpako.jpg"
  ),
  member(
    46,
    "Hamzat Solanke",
    "Executive Chairman",
    "Osun State Internal Revenue Service",
    "State Revenue",
    "photo_46_hamzat-solanke.jpg"
  ),
  member(
    47,
    "Muhammed Abdulkadir",
    "Representative",
    "Federal Ministry of Finance",
    "Partner Agency",
    "photo_47_muhammed-basheer-abdulkadir.jpg"
  ),
];
