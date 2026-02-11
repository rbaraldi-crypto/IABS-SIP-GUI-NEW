export interface InmateProfile {
  id: string;
  name: string;
  photoUrl: string;
  biometricStatus: 'confirmed' | 'pending' | 'failed';
  dateOfBirth: string;
  motherName: string;
  cpf: string;
}

export interface PenalEvent {
  id: string;
  date: string;
  type: string;
  origin: string;
  hashICP: string;
  details: string;
}

export interface Metric {
  label: string;
  value: string | number;
  trend?: string;
  status?: 'normal' | 'critical' | 'warning';
  icon?: string;
}

export interface SimilarityFactor {
  name: string;
  weight: number; // 0-100
}

export interface SimilarCase {
  id: string;
  caseNumber: string;
  penalty: string;
  crime: string;
  decision: string;
  similarity: number;
  factors?: SimilarityFactor[];
}

export interface CaseDocument {
  id: string;
  title: string;
  type: string;
  date: string;
  pages: number;
  signedBy?: string;
  // Novos campos para o Dossiê Digital
  globalStartPage?: number;
  isEvidence?: boolean;
  tags?: string[];
  url?: string; // URL simulada para o PDF
}

export interface SubordinateUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  workload: number; // 0-100%
}

export interface MyCase {
  id: string;
  inmateName: string;
  caseNumber: string;
  priority: 'Alta' | 'Média' | 'Baixa' | 'Delegado';
  type: string;
  status: string;
  entryDate: string;
  similarCases: SimilarCase[];
  documents: CaseDocument[];
  delegatedTo?: SubordinateUser;
  delegatedAt?: string;
  estimatedCompletion?: string;
  // New Hearing Fields
  hearingDate?: string;
  hearingLocation?: string;
  hearingType?: string;
  isVirtual?: boolean;
  virtualLink?: string;
}

// --- New Types for Distribution Screen ---
export interface DistributionCase {
  id: string;
  inmateName: string;
  inmatePhoto: string;
  cpf: string;
  eventType: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  timeInQueue: string;
}

export interface DistributionUser {
  id: string;
  name: string;
  role: 'Analista Penal' | 'Psicólogo' | 'Assistente Social' | 'Juiz da Execução' | 'Coordenador';
  avatar: string;
  workload: number; // 0-100
  status: 'Disponível' | 'Ocupado' | 'Ausente';
  casesCount: number;
  maxCases: number;
}

// --- MASTER ENTITY INDEX TYPES (NOVO) ---
export type EntityRole = 'Detento' | 'Visitante' | 'Advogado' | 'Funcionário' | 'Juiz' | 'Familiar';

export interface EntityRelationship {
  targetId: string;
  targetName: string;
  type: string; // 'Mãe', 'Advogado de', 'Co-réu', 'Visitou'
  date: string;
  details?: string;
}

export interface MasterEntity {
  id: string; // UUID único
  name: string;
  cpf: string;
  photoUrl?: string;
  roles: EntityRole[]; // Pode ter múltiplos papéis ao longo do tempo
  status: 'Ativo' | 'Inativo' | 'Bloqueado' | 'Em Liberdade' | 'Suspenso';
  lastUpdate: string;
  relationships: EntityRelationship[];
  alerts: string[]; // Alertas de inteligência (ex: "Advogado com vínculo familiar")
  biometricsId?: string;
  address?: string;
}

// --- HEARING CALENDAR TYPES (NOVO) ---
export interface CourtRoom {
  id: string;
  name: string;
  type: 'Virtual' | 'Presencial';
  capacity: number;
  status: 'Ativa' | 'Manutenção';
}

export interface HearingEvent {
  id: string;
  caseId: string;
  caseNumber: string;
  inmateName: string;
  type: string; // Justificação, Admonitória, Instrução
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  duration: number; // em horas
  roomId: string;
  judge: string;
  lawyer: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Pendente';
  conflicts?: string[]; // Array de mensagens de conflito
}

export const mockSubordinates: SubordinateUser[] = [
  { id: "u1", name: "Ana Paula Souza", role: "Analista Judiciário", avatar: "AP", workload: 45 },
  { id: "u2", name: "Bruno Mendes", role: "Assessor", avatar: "BM", workload: 80 },
  { id: "u3", name: "Carla Diaz", role: "Estagiária de Direito", avatar: "CD", workload: 20 },
];

// Documentos atualizados com paginação global simulada
export const mockDocuments: CaseDocument[] = [
  { 
    id: "doc-01", 
    title: "Petição Inicial de Progressão", 
    type: "Petição", 
    date: "10/05/2024", 
    pages: 5, 
    signedBy: "Dr. Advogado OAB/SP 123456",
    globalStartPage: 1,
    tags: ["Defesa", "Pedido"],
    url: "https://pdfobject.com/pdf/sample.pdf"
  },
  { 
    id: "doc-02", 
    title: "Boletim Informativo", 
    type: "Certidão", 
    date: "11/05/2024", 
    pages: 2, 
    signedBy: "Diretor da Unidade",
    globalStartPage: 6,
    isEvidence: true,
    tags: ["Administrativo", "Conduta"],
    url: "https://pdfobject.com/pdf/sample.pdf"
  },
  { 
    id: "doc-03", 
    title: "Exame Criminológico", 
    type: "Laudo", 
    date: "12/05/2024", 
    pages: 8, 
    signedBy: "Psicóloga Forense",
    globalStartPage: 8,
    isEvidence: true,
    tags: ["Perícia", "Saúde"],
    url: "https://pdfobject.com/pdf/sample.pdf"
  },
  { 
    id: "doc-04", 
    title: "Manifestação do MP", 
    type: "Parecer", 
    date: "13/05/2024", 
    pages: 3, 
    signedBy: "Promotor de Justiça",
    globalStartPage: 16,
    tags: ["Acusação", "Fiscal"],
    url: "https://pdfobject.com/pdf/sample.pdf"
  },
];

export const mockInmate: InmateProfile = {
  id: "SIP-2024-8921",
  name: "Carlos Eduardo da Silva",
  photoUrl: "https://i.pravatar.cc/300?u=SIP-2024-8921",
  biometricStatus: "confirmed",
  dateOfBirth: "15/03/1985",
  motherName: "Maria Aparecida da Silva",
  cpf: "123.456.789-00"
};

export const mockMetrics: Metric[] = [
  { label: "Total de Apenados", value: "12,450", status: "normal", icon: "Users" },
  { label: "Alertas Críticos", value: 23, status: "critical", icon: "AlertTriangle" },
  { label: "Benefícios Vencidos", value: 145, status: "warning", icon: "Clock" },
  { label: "Aguardando HITL", value: 8, status: "normal", icon: "UserCheck" },
];

export const mockTimeline: PenalEvent[] = [
  {
    id: "evt-001",
    date: "10/01/2024",
    type: "Progressão de Regime",
    origin: "Vara de Execuções Penais - TJSP",
    hashICP: "8f4b2e1...a9c3",
    details: "Concessão de progressão para o regime semiaberto conforme Art. 112 da LEP. Requisito temporal objetivo cumprido."
  },
  {
    id: "evt-002",
    date: "15/12/2023",
    type: "Relatório de Comportamento",
    origin: "Diretoria da Unidade Prisional",
    hashICP: "3d2a1c5...b8e4",
    details: "Atestado de bom comportamento carcerário emitido pelo diretor da unidade. Sem faltas disciplinares graves nos últimos 12 meses."
  },
  {
    id: "evt-003",
    date: "20/05/2023",
    type: "Sentença Condenatória",
    origin: "2ª Vara Criminal",
    hashICP: "7e9d2f1...c4a2",
    details: "Condenação transitada em julgado. Pena fixada em 5 anos e 4 meses de reclusão."
  }
];

export const mockSimilarCases: SimilarCase[] = [
  {
    id: "case-992",
    caseNumber: "0001234-56.2023.8.26.0050",
    penalty: "5 anos",
    crime: "Roubo Majorado",
    decision: "Concedido",
    similarity: 92,
    factors: [
        { name: "Tipificação Penal (Roubo Majorado)", weight: 45 },
        { name: "Reincidência Específica", weight: 30 },
        { name: "Bom Comportamento Atestado", weight: 15 },
        { name: "Tempo de Pena (+/- 10%)", weight: 10 }
    ]
  },
  {
    id: "case-881",
    caseNumber: "0005678-12.2022.8.26.0050",
    penalty: "6 anos",
    crime: "Roubo Majorado",
    decision: "Negado (Falta Grave)",
    similarity: 85,
    factors: [
        { name: "Tipificação Penal", weight: 50 },
        { name: "Histórico Disciplinar (Falta Grave)", weight: 40 },
        { name: "Jurisdição (TJSP)", weight: 10 }
    ]
  },
  {
    id: "case-773",
    caseNumber: "0009876-43.2023.8.26.0050",
    penalty: "5 anos e 2 meses",
    crime: "Roubo Simples",
    decision: "Concedido",
    similarity: 78,
    factors: [
        { name: "Tipificação Penal", weight: 40 },
        { name: "Tempo de Pena", weight: 30 },
        { name: "Ausência de Violência", weight: 30 }
    ]
  }
];

export const mockMyCases: MyCase[] = [
  {
    id: "case-rev-001",
    inmateName: "Carlos Eduardo da Silva",
    caseNumber: "0008921-33.2024.8.26.0050",
    priority: "Alta",
    type: "Progressão de Regime",
    status: "Aguardando Análise",
    entryDate: "10/05/2024",
    similarCases: mockSimilarCases,
    documents: mockDocuments,
    hearingDate: "25/06/2024 14:30",
    hearingLocation: "Sala Virtual 03 - Teams",
    hearingType: "Audiência de Justificação",
    isVirtual: true,
    virtualLink: "https://teams.microsoft.com/l/meetup-join/..."
  },
  {
    id: "case-rev-002",
    inmateName: "Roberto Alves Junior",
    caseNumber: "0012455-11.2023.8.26.0050",
    priority: "Alta",
    type: "Livramento Condicional",
    status: "Pendente Documentação",
    entryDate: "12/05/2024",
    similarCases: [
      {
        id: "sim-004",
        caseNumber: "0023456-78.2022.8.26.0050",
        penalty: "8 anos",
        crime: "Tráfico de Drogas",
        decision: "Negado",
        similarity: 95,
        factors: [
            { name: "Natureza do Crime (Hediondo)", weight: 60 },
            { name: "Reincidência", weight: 25 },
            { name: "Fração de Pena (3/5)", weight: 15 }
        ]
      },
      {
        id: "sim-005",
        caseNumber: "0034567-89.2022.8.26.0050",
        penalty: "7 anos e 6 meses",
        crime: "Tráfico de Drogas",
        decision: "Concedido",
        similarity: 88,
        factors: [
            { name: "Natureza do Crime", weight: 50 },
            { name: "Primariedade", weight: 30 },
            { name: "Trabalho Interno", weight: 20 }
        ]
      }
    ],
    documents: [mockDocuments[0], mockDocuments[2]],
    hearingDate: "28/06/2024 10:00",
    hearingLocation: "Fórum Criminal Barra Funda - Sala 12",
    hearingType: "Audiência Admonitória",
    isVirtual: false
  },
  {
    id: "case-rev-003",
    inmateName: "Fernanda Oliveira",
    caseNumber: "0005543-22.2024.8.26.0050",
    priority: "Média",
    type: "Remição de Pena",
    status: "Em Análise",
    entryDate: "14/05/2024",
    similarCases: [
       {
        id: "sim-006",
        caseNumber: "0045678-90.2023.8.26.0050",
        penalty: "4 anos",
        crime: "Furto Qualificado",
        decision: "Concedido",
        similarity: 82,
        factors: [
            { name: "Crime sem Violência", weight: 40 },
            { name: "Dias Trabalhados", weight: 40 },
            { name: "Leitura de Livros", weight: 20 }
        ]
      }
    ],
    documents: [mockDocuments[1]]
  },
  {
    id: "case-rev-004",
    inmateName: "João Pedro Santos",
    caseNumber: "0009988-77.2024.8.26.0050",
    priority: "Baixa",
    type: "Transferência",
    status: "Aguardando Vaga",
    entryDate: "15/05/2024",
    similarCases: [],
    documents: []
  }
];

export const mockDistributionCases: DistributionCase[] = [
  {
    id: "dist-001",
    inmateName: "Marcos Paulo Rocha",
    inmatePhoto: "https://i.pravatar.cc/150?u=dist-001",
    cpf: "333.222.111-00",
    eventType: "Progressão de Regime",
    priority: "Alta",
    timeInQueue: "2h 15m"
  },
  {
    id: "dist-002",
    inmateName: "Juliana Mendes",
    inmatePhoto: "https://i.pravatar.cc/150?u=dist-002",
    cpf: "444.555.666-77",
    eventType: "Livramento Condicional",
    priority: "Média",
    timeInQueue: "4h 30m"
  },
  {
    id: "dist-003",
    inmateName: "Rafael Costa",
    inmatePhoto: "https://i.pravatar.cc/150?u=dist-003",
    cpf: "999.888.777-66",
    eventType: "Remição por Leitura",
    priority: "Baixa",
    timeInQueue: "1d 2h"
  },
  {
    id: "dist-004",
    inmateName: "Pedro Henrique",
    inmatePhoto: "https://i.pravatar.cc/150?u=dist-004",
    cpf: "111.222.333-44",
    eventType: "Indulto Natalino",
    priority: "Alta",
    timeInQueue: "45m"
  }
];

export const mockDistributionUsers: DistributionUser[] = [
  {
    id: "user-001",
    name: "Dr. Silva",
    role: "Juiz da Execução",
    avatar: "https://i.pravatar.cc/150?u=user-001",
    workload: 85,
    status: "Ocupado",
    casesCount: 17,
    maxCases: 20
  },
  {
    id: "user-002",
    name: "Ana Clara",
    role: "Analista Penal",
    avatar: "https://i.pravatar.cc/150?u=user-002",
    workload: 40,
    status: "Disponível",
    casesCount: 8,
    maxCases: 20
  },
  {
    id: "user-003",
    name: "Roberto Campos",
    role: "Psicólogo",
    avatar: "https://i.pravatar.cc/150?u=user-003",
    workload: 60,
    status: "Disponível",
    casesCount: 6,
    maxCases: 10
  },
  {
    id: "user-004",
    name: "Mariana Luz",
    role: "Assistente Social",
    avatar: "https://i.pravatar.cc/150?u=user-004",
    workload: 90,
    status: "Ausente",
    casesCount: 18,
    maxCases: 20
  }
];

// --- MOCK MASTER ENTITIES ---
export const mockMasterEntities: MasterEntity[] = [
  {
    id: "ent-001",
    name: "Carlos Eduardo da Silva",
    cpf: "123.456.789-00",
    photoUrl: "https://i.pravatar.cc/300?u=SIP-2024-8921",
    roles: ["Detento"],
    status: "Ativo",
    lastUpdate: "10/05/2024",
    biometricsId: "ABIS-998877",
    address: "Rua das Flores, 123 - São Paulo/SP",
    alerts: [],
    relationships: [
      { targetId: "ent-002", targetName: "Maria da Silva", type: "Mãe", date: "15/03/1985" },
      { targetId: "ent-003", targetName: "Dr. Roberto Mendes", type: "Advogado Constituído", date: "20/01/2024" }
    ]
  },
  {
    id: "ent-002",
    name: "Maria da Silva",
    cpf: "987.654.321-11",
    photoUrl: "https://i.pravatar.cc/300?u=ent-002",
    roles: ["Visitante", "Familiar"],
    status: "Ativo",
    lastUpdate: "15/06/2024",
    biometricsId: "ABIS-112233",
    address: "Rua das Flores, 123 - São Paulo/SP",
    alerts: [],
    relationships: [
      { targetId: "ent-001", targetName: "Carlos Eduardo da Silva", type: "Filho", date: "15/03/1985" }
    ]
  },
  {
    id: "ent-003",
    name: "Dr. Roberto Mendes",
    cpf: "456.789.123-44",
    photoUrl: "https://i.pravatar.cc/300?u=ent-003",
    roles: ["Advogado"],
    status: "Ativo",
    lastUpdate: "10/06/2024",
    biometricsId: "ABIS-445566",
    address: "Av. Paulista, 1000 - Conj 45 - São Paulo/SP",
    alerts: ["Advogado com múltiplos clientes da mesma facção (Monitorar)"],
    relationships: [
      { targetId: "ent-001", targetName: "Carlos Eduardo da Silva", type: "Cliente", date: "20/01/2024" },
      { targetId: "ent-004", targetName: "João Pedro Santos", type: "Cliente", date: "15/02/2024" }
    ]
  },
  {
    id: "ent-004",
    name: "João Pedro Santos",
    cpf: "111.222.333-44",
    photoUrl: "https://i.pravatar.cc/300?u=ent-004",
    roles: ["Detento", "Visitante"], // Exemplo de entidade com múltiplos papéis históricos
    status: "Ativo",
    lastUpdate: "15/05/2024",
    biometricsId: "ABIS-778899",
    address: "Rua B, 45 - Osasco/SP",
    alerts: ["Ex-Visitante que se tornou Detento (Risco de Vínculo)"],
    relationships: [
      { targetId: "ent-003", targetName: "Dr. Roberto Mendes", type: "Advogado Constituído", date: "15/02/2024" },
      { targetId: "ent-001", targetName: "Carlos Eduardo da Silva", type: "Co-réu (Processo Antigo)", date: "10/01/2020", details: "Absolvido no processo 0001/2020" }
    ]
  }
];

// --- MOCK HEARING CALENDAR DATA ---
export const mockCourtRooms: CourtRoom[] = [
  { id: 'room-01', name: 'Sala Virtual 01 (Teams)', type: 'Virtual', capacity: 10, status: 'Ativa' },
  { id: 'room-02', name: 'Sala Virtual 02 (Teams)', type: 'Virtual', capacity: 10, status: 'Ativa' },
  { id: 'room-03', name: 'Sala de Audiência A (Fórum)', type: 'Presencial', capacity: 20, status: 'Ativa' },
  { id: 'room-04', name: 'Sala de Audiência B (Fórum)', type: 'Presencial', capacity: 20, status: 'Manutenção' },
];

export const mockHearings: HearingEvent[] = [
  {
    id: 'h-001',
    caseId: 'case-rev-001',
    caseNumber: '0008921-33.2024.8.26.0050',
    inmateName: 'Carlos Eduardo da Silva',
    type: 'Justificação',
    date: '2024-06-25',
    time: '14:00',
    duration: 1,
    roomId: 'room-01',
    judge: 'Dr. Silva',
    lawyer: 'Dr. Roberto Mendes',
    status: 'Agendada'
  },
  {
    id: 'h-002',
    caseId: 'case-rev-002',
    caseNumber: '0012455-11.2023.8.26.0050',
    inmateName: 'Roberto Alves Junior',
    type: 'Admonitória',
    date: '2024-06-25',
    time: '15:00',
    duration: 1,
    roomId: 'room-01',
    judge: 'Dr. Silva',
    lawyer: 'Dra. Ana Souza',
    status: 'Agendada'
  }
];

export const mockUnscheduledHearings: HearingEvent[] = [
  {
    id: 'h-new-001',
    caseId: 'case-rev-003',
    caseNumber: '0005543-22.2024.8.26.0050',
    inmateName: 'Fernanda Oliveira',
    type: 'Oitiva de Testemunha',
    date: '',
    time: '',
    duration: 1,
    roomId: '',
    judge: 'Dr. Silva',
    lawyer: 'Defensoria Pública',
    status: 'Pendente'
  },
  {
    id: 'h-new-002',
    caseId: 'case-rev-004',
    caseNumber: '0009988-77.2024.8.26.0050',
    inmateName: 'João Pedro Santos',
    type: 'Justificação (Falta Grave)',
    date: '',
    time: '',
    duration: 1,
    roomId: '',
    judge: 'Dr. Silva',
    lawyer: 'Dr. Roberto Mendes', // Conflito proposital com h-001 se agendado na mesma hora
    status: 'Pendente'
  }
];
