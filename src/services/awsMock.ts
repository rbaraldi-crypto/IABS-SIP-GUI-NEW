// Helper function to generate UUIDs safely in any environment
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto is not available or incomplete
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Types ---

export interface AuditLogItem {
  PK: string; // Partition Key: CASE#{caseId}
  SK: string; // Sort Key: TIMESTAMP#{isoDate}
  ActionType: string;
  User: string;
  Role: string;
  Details: string;
  Timestamp: string;
  Hash: string; // Integridade
}

export interface S3Object {
  Key: string;
  LastModified: Date;
  Size: number;
  Url: string; // Em um caso real, seria uma Signed URL
}

// --- Mock Data Store (In-Memory DynamoDB) ---

let dynamoDbStore: AuditLogItem[] = [
  {
    PK: "CASE#SIP-2024-8921",
    SK: `TIMESTAMP#${new Date(Date.now() - 86400000).toISOString()}`,
    ActionType: "VIEW_PROFILE",
    User: "analista.paula",
    Role: "ANALISTA",
    Details: "Acesso ao perfil do apenado",
    Timestamp: new Date(Date.now() - 86400000).toISOString(),
    Hash: generateUUID()
  },
  {
    PK: "CASE#SIP-2024-8921",
    SK: `TIMESTAMP#${new Date(Date.now() - 43200000).toISOString()}`,
    ActionType: "DOC_UPLOAD",
    User: "adv.carlos",
    Role: "ADVOGADO",
    Details: "Upload de Petição Inicial (S3: bucket-juridico/peticao_01.pdf)",
    Timestamp: new Date(Date.now() - 43200000).toISOString(),
    Hash: generateUUID()
  }
];

// --- Mock S3 Service ---

export const s3Service = {
  listObjects: async (prefix: string): Promise<S3Object[]> => {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        Key: `${prefix}/peticao_inicial.pdf`,
        LastModified: new Date(Date.now() - 100000000),
        Size: 1024 * 450, // 450KB
        Url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // PDF Público de exemplo
      },
      {
        Key: `${prefix}/laudo_criminologico.pdf`,
        LastModified: new Date(Date.now() - 50000000),
        Size: 1024 * 1200, // 1.2MB
        Url: "https://pdfobject.com/pdf/sample.pdf" // Outro PDF público
      },
      {
        Key: `${prefix}/certidao_carceraria.pdf`,
        LastModified: new Date(Date.now() - 2000000),
        Size: 1024 * 150, // 150KB
        Url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    ];
  },

  uploadObject: async (file: File, key: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`[S3 Mock] Uploading ${file.name} to ${key}`);
    return `https://s3.amazonaws.com/mock-bucket/${key}`;
  }
};

// --- Mock DynamoDB Service ---

export const dynamoService = {
  putItem: async (item: Omit<AuditLogItem, 'PK' | 'SK' | 'Hash'> & { CaseId: string }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newItem: AuditLogItem = {
      PK: `CASE#${item.CaseId}`,
      SK: `TIMESTAMP#${new Date().toISOString()}`,
      ActionType: item.ActionType,
      User: item.User,
      Role: item.Role,
      Details: item.Details,
      Timestamp: new Date().toISOString(),
      Hash: generateUUID()
    };

    dynamoDbStore.unshift(newItem); // Adiciona no início
    console.log("[DynamoDB Mock] Item gravado:", newItem);
    return newItem;
  },

  queryLogs: async (caseId: string): Promise<AuditLogItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return dynamoDbStore.filter(item => item.PK === `CASE#${caseId}`);
  }
};
