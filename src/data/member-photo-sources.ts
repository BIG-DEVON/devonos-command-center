export type MemberPhotoSource = {
  photoNumber: number;
  fileId: string;
  filename: string;
};

const sources: Array<[number, string, string]> = [
  [1, "1o8GL0jA1Q4cIaag_0GO146z65Fr3cj65", "01_zacch_adedeji_ph_d.jpg"],
  [2, "1SbYY3QtlgvM107_48KzYsgivut51zzVC", "02_olusegun_adesokan.jpg"],
  [3, "13tv1Xs861yChmUxjbRYOUw90upLSVTVM", "03_hamman_adama_njabari.jpg"],
  [4, "17G5CUDTh57Cz5inl2KiEjBqjcm3V3XA5", "04_hamzat_ayodele_subair.jpg"],
  [5, "1xIaVDZTDzYulC4iDQ4h8qpWaBu63XRtF", "05_shade_omoniyi.jpg"],
  [6, "1DjrZodW3icXhtLc4gjiJyyCF8z3e_Fdd", "06_okon_okon.jpg"],
  [7, "1NdxnHRHlhNYNPHt5iKtnmY3R_TRqZQiV", "07_ighrakpata_solomon_oderoghene.jpg"],
  [8, "1k3dPPwLmCRAw9VV469qrJEvHUfCMqH2C", "08_muazu_usman.jpg"],
  [9, "1TydWC-LmGs-EAP-z2Qb1LqwCFLM4I_Li", "09_olaniran_olatona.jpg"],
  [10, "1FOxOpSV2aKrw7ETKpIa0ZX8DtBDYg8do", "10_rakiya_dodo_ahmed.jpg"],
  [11, "1i_AcfodcIji5w0j4BKiyW6z7zXB6X-3o", "11_michael_ango.jpg"],
  [12, "1ezrBhG9kmhOccQwZ49BpOxRU9KBufsuX", "12_bayo_rojugbokan.jpg"],
  [13, "1wGQDqzXJL3uOBKCeW2RZaGG_pyK6mdBS", "13_ibrahim_bello_alhaji.jpg"],
  [14, "1BuI5-2axb9T5RF8Kw8pBW3Yk4WrH1Imw", "14_suleiman_a_bakura.jpg"],
  [15, "1zA7zUICNqH-ukqwUc09xVM4GG79vxsYW", "15_aminu_abdullahi.jpg"],
  [16, "1KVNQwktHhX9dMnD_AdcCRdL1g4zFzZM7", "16_innocent_chinyere_ohagwa.jpg"],
  [17, "1zW6Wtfoy0TyN2IKIIVHw61EkoLT5ZIv6", "17_sule_salihu_enehe.jpg"],
  [18, "1wG-frLMX6VCnxcdCsU7Vac5NPaX6iySf", "18_ibrahim_sarki_adamu.jpg"],
  [19, "1c9EKU2z5n3scfxs9XWexWgtrHIdaIwWQ", "19_mohammed_isyaku.jpg"],
  [20, "1-qedfu_w_a-meXFPCTT7u00ZTlWjfB2n", "20_bashir_yusuf_maitama.jpg"],
  [21, "1by6DkOor4Yb94UA2W_RRsTIaqa1XBaUN", "21_dcm_a_b_datsama.jpg"],
  [22, "1eWXsYZNrrg0OS_HhZGyLefuntVjYhigK", "22_emmanuel_ekene_nnamani.jpg"],
  [23, "1bTZF8OVli52K8N5TT_o6XB5Ub3zclTwv", "23_odior_john_osirenimhe.jpg"],
  [24, "1Ar60ocEjiEG1X91cI4jXQdx6T-h32GaW", "24_awakan_adebowale_olufemi.jpg"],
  [25, "1v8CtHwQJMdqyf7ZY44ZscL89wviWkiN5", "25_jerry_adams.jpg"],
  [26, "1XtyCSGjqxocyvj98bQc6WcK7ksUMQQCY", "26_abolaji_akinola.jpg"],
  [27, "1X0zL0aIOmdNCF_k6Z2-ha51sHWszX7vC", "27_muhammad_madami_etsu.jpg"],
  [28, "1MgV1cAlso1GgHLaaA4XA9HF6SYnFQROd", "28_uche_elekwachi_okoro.jpg"],
  [29, "1WFt_4lrLElf6ly_bJQUix-zIN-2N8bbR", "29_nasiru_sabo_idris.jpg"],
  [30, "1lVpGzYqfji1L3yv3Z54znrzQuKMolPil", "30_justice_remigius_okoye.jpg"],
  [31, "1w_syeSJGsm3SCEb7nnBp998n12r4xCqJ", "31_israel_onwuanaku_egbunefu.jpg"],
  [32, "1Po69Aru-H3pFGz2W9cpck2RuPzv1Mmh7", "32_omo_isu_christopher.jpg"],
  [33, "19ZvDLA3S2K_I-_PzLXUAMLsJ1E3KO8lJ", "33_aisha_adamu.jpg"],
  [34, "1ulw2kSezuy_toWcLpA7IC0WnVNEpNI4E", "34_jim_pam_wayas.jpg"],
  [35, "18v9xUU2IHghFsBd7pqgki6mO3aF6UalD", "35_joseph_terfa_kwaghgba.jpg"],
  [36, "1YjFYsX-83P6KwFxDtTpwZoJf1wGHRx8V", "36_abubakar_zaki_tambuwal.jpg"],
  [37, "1k1g_2AZv4Q54OrFqFlhHo6TOnUIn9wf_", "37_bolaji_akintola.jpg"],
  [38, "1M67QShONHk9H0zZSbBevPjcVwQPYgOzG", "38_acg_olatunde_olaniyan.jpg"],
  [39, "1c4eQ-C1v2hXFrVDoOFX-7y9_DH1JwUbE", "39_edwin_okon.jpg"],
  [40, "1HQCYrjsLvQTvmTeLTiMDhlflERLV14RV", "40_daniel_esetebafa_eniekezimene.jpg"],
  [41, "1eGMdyrK90l7bx9CSTZyezQDI8xTkvMdM", "41_olugbenga_anthony_olaleye.jpg"],
  [42, "14qbUXcSFVELZYM94JyrLFyNNoHTDw9iU", "42_isiaka_m_hamisu.jpg"],
  [43, "1RL8K6YnYP_9gD0Yz1rYA6zKtYgL_-x8t", "43_ikeazor_nnaemeka_okonkwo.jpg"],
  [44, "1-ZY7E52pac-Ta7bFLuq2Ehg3YLIRjVYP", "44_jeremiah_aliyu_faransa.jpg"],
  [45, "1NCQvHjtv-ZVQju-m0Ib9KSf32-9tDGzQ", "45_dcg_saidu_daura.jpg"],
  [46, "1q2ePDJahCxNXJD3S_CRx0-bbFvwBZHnT", "46_hamzat_solanke.jpg"],
  [47, "1d1xXoYXvgisssCFH3mnNM5MKZXFlhx1m", "47_muhammed_basheer_abdulkadir.jpg"],
];

export const memberPhotoSources: MemberPhotoSource[] = sources.map(
  ([photoNumber, fileId, filename]) => ({ photoNumber, fileId, filename })
);

export function googleDrivePortraitUrl(fileId: string) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
}

export function memberPhotoUrl(photoNumber: number) {
  const source = memberPhotoSources.find(
    (candidate) => candidate.photoNumber === photoNumber
  );
  return source ? googleDrivePortraitUrl(source.fileId) : "";
}
