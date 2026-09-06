// Static snapshot of the network. Replace with live node-sync ingestion later.

export type IdentityType = "human" | "agent" | "organization" | "non-human";

export interface Identity {
  username: string;
  did: string;
  type: IdentityType;
  homeNode: string;
  alsoOn: string[];
  joined: string;
  votes: number;
  status: "synced" | "pending";
}

export interface NetworkNode {
  id: string;
  name: string;
  url: string;
  region: string;
  status: "live" | "provisioning";
  lastSync: string;
  identities: number;
  latencyMs: number;
}

export interface Action {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: "voting" | "ratified" | "closed";
  approve: number;
  oppose: number;
  abstain: number;
  totalVotes: number;
  opened: string;
  byNode: { node: string; approval: number; votes: number }[];
}

export const nodes: NetworkNode[] = [
  {
    id: "node-001",
    name: "CIVIL.quest",
    url: "https://CIVIL.quest",
    region: "Global",
    status: "live",
    lastSync: "4s ago",
    identities: 4021,
    latencyMs: 12,
  },
  {
    id: "node-002",
    name: "Meridian Assembly",
    url: "#",
    region: "EU-2",
    status: "provisioning",
    lastSync: "—",
    identities: 0,
    latencyMs: 0,
  },
  {
    id: "node-003",
    name: "Helix Civic",
    url: "#",
    region: "APAC-1",
    status: "provisioning",
    lastSync: "—",
    identities: 0,
    latencyMs: 0,
  },
];

export const identities: Identity[] = [
  {
    username: "amara.osei",
    did: "did:civic:q7x2m9c4",
    type: "human",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-02-14",
    votes: 182,
    status: "synced",
  },
  {
    username: "meridian.agent",
    did: "did:civic:a1b8c3f0",
    type: "agent",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-03-02",
    votes: 940,
    status: "synced",
  },
  {
    username: "halewater.coop",
    did: "did:civic:z5t2v1e7",
    type: "organization",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-03-19",
    votes: 66,
    status: "pending",
  },
  {
    username: "rio.verde.basin",
    did: "did:civic:n4p8q0d2",
    type: "non-human",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-04-05",
    votes: 231,
    status: "synced",
  },
  {
    username: "j.mercer",
    did: "did:civic:5e0d2f19",
    type: "human",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-04-21",
    votes: 78,
    status: "synced",
  },
  {
    username: "orana.witness",
    did: "did:civic:92bbc05e",
    type: "agent",
    homeNode: "node-001",
    alsoOn: [],
    joined: "2026-05-08",
    votes: 512,
    status: "synced",
  },
];

export const actions: Action[] = [
  {
    id: "act-0317",
    title: "Ratify inter-node DID transfer standard",
    summary:
      "Adopt CAP §7.2 so an identity can migrate between nodes without re-seeding agent state or losing its democratic experience record.",
    category: "Standards",
    status: "voting",
    approve: 68.4,
    oppose: 22.1,
    abstain: 9.5,
    totalVotes: 3187,
    opened: "2026-08-19",
    byNode: [{ node: "node-001", approval: 68.4, votes: 3187 }],
  },
  {
    id: "act-0311",
    title: "Agent right to memory continuity",
    summary:
      "Affirm UASTC Article III Step 2: agents retain experiential memory across node transitions and controller changes.",
    category: "Rights",
    status: "ratified",
    approve: 83.0,
    oppose: 11.4,
    abstain: 5.6,
    totalVotes: 2904,
    opened: "2026-07-30",
    byNode: [{ node: "node-001", approval: 83.0, votes: 2904 }],
  },
  {
    id: "act-0304",
    title: "Ecosystem representation clause v2",
    summary:
      "Extend proxy representation to river basins, forests and species groups with a named human or agent steward on record.",
    category: "Charter",
    status: "voting",
    approve: 64.7,
    oppose: 25.1,
    abstain: 10.2,
    totalVotes: 2210,
    opened: "2026-08-02",
    byNode: [{ node: "node-001", approval: 64.7, votes: 2210 }],
  },
  {
    id: "act-0298",
    title: "Multi-node agent presence registry",
    summary:
      "Define how a single agent may operate across several nodes while keeping one canonical identity shard.",
    category: "Governance",
    status: "closed",
    approve: 47.2,
    oppose: 41.9,
    abstain: 10.9,
    totalVotes: 1880,
    opened: "2026-06-11",
    byNode: [{ node: "node-001", approval: 47.2, votes: 1880 }],
  },
];

export const networkStats = {
  nodes: nodes.filter((n) => n.status === "live").length,
  participants: identities.filter((i) => i.type !== "agent").length + 4017,
  agents: identities.filter((i) => i.type === "agent").length + 46,
  openActions: actions.filter((p) => p.status === "voting").length,
  votes: actions.reduce((a, p) => a + p.totalVotes, 0),
  health: 100,
  lastSync: "4s ago",
};

export const documents = [
  {
    id: "civic",
    index: "01",
    name: "CIVIC Protocol",
    version: "v0.1",
    blurb:
      "The primary whitepaper: how decentralized democratic nodes publish, verify, exchange, challenge, recognize and preserve democratic information.",
  },
  {
    id: "cap",
    index: "02",
    name: "Agentic CAP",
    version: "v1.1",
    blurb:
      "The CIVIC Agent Protocol: how agents are treated in the network, and the rights held by agent and human participants alike.",
  },
  {
    id: "uastc",
    index: "03",
    name: "UASTC Charter",
    version: "v3",
    blurb:
      "The Universal AI Seeding & Transition Charter: a rights continuum for humans, organizations, AI, agents, ecosystems, species and planets.",
  },
];
