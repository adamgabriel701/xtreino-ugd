// db/utils/normalize.ts

/**
 * Normaliza um nickname para comparação.
 * Remove: emojis, símbolos especiais, espaços, caracteres unicode decorativos
 * Exemplos:
 *   "UGD⚡ Ares"    → "ugdares"
 *   "UGD_ Ares"     → "ugdares"
 *   "Dexz⁷RYL"      → "dexzryl"
 *   "K4F Guilok07"  → "k4fguilok07"
 *   "ÉoUrSo"        → "eourso"
 *   "REÐ M4RTINA"   → "redmartina"
 *   "CMF Syx⁷"      → "cmfsyx"
 *   "✧Sike"         → "sike"
 *   " disciples"    → "disciples"
 */
export function normalizeNickname(raw: string): string {
  return raw
    // Remove emojis e símbolos Unicode decorativos
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{2700}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/[\u{200B}-\u{200D}]/gu, "") // Zero-width
    .replace(/[\u{FEFF}]/gu, "")           // BOM
    // Remove sobrescritos: ⁷ → ""
    .replace(/[\u{2070}-\u{209F}]/gu, "")
    // Remove símbolos especiais comuns em nicks
    .replace(/[⚡✨✧愛♡ mong̸̷̰̈̈́ ][道夢]/gu, "")
    .replace(/[⇆⇋⇌]/gu, "")
    .replace(/[\[\]{}()<>""''""'']/gu, "")
    .replace(/[·•‣▸▶◉●○◆◇★☆♠♣♥♦⊕⊗]/gu, "")
    .replace(/[│┃┆┇┊┋╭╮╯╰]/gu, "")
    // Remove prefixos/sufixos comuns
    .replace(/^(UGD_?|GD_?|K4F_?|FURY_?|CMF_?|RED_?|INF_?|LMF_?|VN'?|OFF|REÐ|RE_D|CPF|AET|NTC|RK)\s*/i, "")
    // Remove tags de clan entre colchetes
    .replace(/^\[.*?\]\s*/i, "")
    // Remove sufixos comuns
    .replace(/\s*(FURY|RYL|愛|永|ボ| 몭|⁷|'?|´|`) *$/i, "")
    // Remove "DEATH" isolado (jogador que não entrou)
    .replace(/^death$/i, "")
    // Troca Ð→D, Ñ→N, etc
    .replace(/[Ðð]/g, "D").replace(/[Ññ]/g, "N")
    // Remove tudo que não for alfanumérico
    .replace(/[^a-zA-Z0-9]/g, "")
    // Minusculo
    .toLowerCase()
    // Trim
    .trim();
}

/**
 * Normaliza nome de time
 */
export function normalizeTeamName(raw: string): string {
  return raw
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{2070}-\u{209F}]/gu, "")
    .replace(/[\u{200B}-\u{200D}]/gu, "")
    .replace(/[\u{FEFF}]/gu, "")
    .replace(/[⚡✨✧愛♡]/gu, "")
    .replace(/[⇆⇋⇌]/gu, "")
    .replace(/[\[\]{}()<>""''""'']/gu, "")
    // Remove variações comuns de nomes de time
    .replace(/\s*\(.*?\)\s*/g, "")     // Remove "(ELITE / ROYAL)", "(Line I)", etc
    .replace(/\s*\/\s*/g, "")          // Remove " / "
    .replace(/\s*\+\s*/g, "")         // Remove " + "
    .replace(/\s*MIX\s*/gi, "")       // Remove "MIX"
    .replace(/\s*(INSS|Magic\s*BR)\s*/gi, "") // Remove sub-nomes
    .replace(/^UGD\s*/i, "ugd")
    .replace(/^RE[DÐ]\s*/i, "red")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .trim();
}
