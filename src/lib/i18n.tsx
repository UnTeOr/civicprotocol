import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.overview": "Overview",
  "nav.registry": "Registry",
  "nav.nodes": "Nodes",
  "nav.actions": "Actions",
  "nav.protocol": "Protocol",
  "nav.node": "Run a node",
  "nav.about": "About",
  "common.search": "Search DID, node, action…",
  "common.readonly": "Read-only",
  "common.lastSync": "last sync",
  "common.viewAll": "View all",
  "common.openNode": "Open node",
  "common.type": "Type",
  "common.status": "Status",
  "common.homeNode": "Home node",
  "common.identifier": "Identifier",
  "common.votes": "Votes",
  "common.approval": "Approval",
  "common.noResults": "No records match this query.",
  "stat.nodes": "Live nodes",
  "stat.participants": "Participants",
  "stat.agents": "Active agents",
  "stat.actions": "Open actions",
  "stat.votes": "Votes recorded",
  "stat.health": "Sync health",
  "home.kicker": "Protocol observatory",
  "home.title": "The shared data layer of the civic network.",
  "home.lede":
    "Every identity, node and vote across all connected platforms — aggregated, verifiable, read-only. To take part, open a node.",
  "home.registry": "Identity registry",
  "home.registryLede":
    "Global index of every unique name and DID registered across the network.",
  "home.nodes": "Node directory",
  "home.nodesLede": "Connected platforms and their current sync state.",
  "home.actions": "Latest actions",
  "home.actionsLede": "Aggregated score-vote output from every node.",
  "home.docs": "The framework",
};

const overrides: Partial<Record<LocaleCode, Dict>> = {
  es: {
    "nav.overview": "Resumen",
    "nav.registry": "Registro",
    "nav.nodes": "Nodos",
    "nav.actions": "Acciones",
    "nav.protocol": "Protocolo",
    "nav.node": "Crear un nodo",
    "nav.about": "Acerca de",
    "common.search": "Buscar DID, nodo, acción…",
    "common.readonly": "Solo lectura",
    "common.lastSync": "última sincronización",
    "common.viewAll": "Ver todo",
    "common.openNode": "Abrir nodo",
    "common.type": "Tipo",
    "common.status": "Estado",
    "common.homeNode": "Nodo base",
    "common.identifier": "Identificador",
    "common.votes": "Votos",
    "common.approval": "Aprobación",
    "common.noResults": "Ningún registro coincide.",
    "stat.nodes": "Nodos activos",
    "stat.participants": "Participantes",
    "stat.agents": "Agentes activos",
    "stat.actions": "Acciones abiertas",
    "stat.votes": "Votos registrados",
    "stat.health": "Salud de sincronización",
    "home.kicker": "Observatorio del protocolo",
    "home.title": "La capa de datos compartida de la red cívica.",
    "home.lede":
      "Cada identidad, nodo y voto de todas las plataformas conectadas — agregado, verificable, solo lectura. Para participar, abre un nodo.",
    "home.registry": "Registro de identidades",
    "home.registryLede": "Índice global de cada nombre único y DID de la red.",
    "home.nodes": "Directorio de nodos",
    "home.nodesLede": "Plataformas conectadas y su estado de sincronización.",
    "home.actions": "Últimas acciones",
    "home.actionsLede": "Resultado agregado de las votaciones de todos los nodos.",
    "home.docs": "El marco",
  },
  fr: {
    "nav.overview": "Aperçu",
    "nav.registry": "Registre",
    "nav.nodes": "Nœuds",
    "nav.actions": "Actions",
    "nav.protocol": "Protocole",
    "nav.node": "Créer un nœud",
    "nav.about": "À propos",
    "common.search": "Rechercher DID, nœud, action…",
    "common.readonly": "Lecture seule",
    "home.title": "La couche de données partagée du réseau civique.",
  },
  de: {
    "nav.overview": "Übersicht",
    "nav.registry": "Register",
    "nav.nodes": "Knoten",
    "nav.actions": "Aktionen",
    "nav.protocol": "Protokoll",
    "nav.node": "Knoten betreiben",
    "nav.about": "Über",
    "common.readonly": "Nur lesen",
    "home.title": "Die gemeinsame Datenschicht des zivilen Netzwerks.",
  },
  pt: {
    "nav.overview": "Visão geral",
    "nav.registry": "Registo",
    "nav.nodes": "Nós",
    "nav.actions": "Ações",
    "nav.protocol": "Protocolo",
    "nav.node": "Criar um nó",
    "nav.about": "Sobre",
    "common.readonly": "Somente leitura",
    "home.title": "A camada de dados partilhada da rede cívica.",
  },
  ar: {
    "nav.overview": "نظرة عامة",
    "nav.registry": "السجل",
    "nav.nodes": "العقد",
    "nav.actions": "إجراءات",
    "nav.protocol": "البروتوكول",
    "nav.node": "شغّل عقدة",
    "nav.about": "حول",
    "common.readonly": "للقراءة فقط",
    "home.title": "طبقة البيانات المشتركة للشبكة المدنية.",
  },
  zh: {
    "nav.overview": "总览",
    "nav.registry": "登记表",
    "nav.nodes": "节点",
    "nav.actions": "行动",
    "nav.protocol": "协议",
    "nav.node": "运行节点",
    "nav.about": "关于",
    "common.readonly": "只读",
    "home.title": "公民网络的共享数据层。",
  },
  ja: {
    "nav.overview": "概要",
    "nav.registry": "レジストリ",
    "nav.nodes": "ノード",
    "nav.actions": "アクション",
    "nav.protocol": "プロトコル",
    "nav.node": "ノードを運用",
    "nav.about": "概要説明",
    "common.readonly": "読み取り専用",
    "home.title": "市民ネットワークの共有データ層。",
  },
};

const I18nContext = createContext<{
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (key: string) => string;
}>({ locale: "en", setLocale: () => {}, t: (k) => en[k] ?? k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("civic-locale") as LocaleCode | null;
    if (stored && LOCALES.some((l) => l.code === stored)) setLocale(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("civic-locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = (key: string) => overrides[locale]?.[key] ?? en[key] ?? key;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
