export declare type CustomSchemaProvider = (uri: string) => Promise<string | string[]>;

export enum MODIFICATION_ACTIONS {
  'delete',
  'add',
  'deleteAll',
}

export interface SchemaAdditions {
  schema: string;
  action: MODIFICATION_ACTIONS.add;
  path: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export interface SchemaDeletions {
  schema: string;
  action: MODIFICATION_ACTIONS.delete;
  path: string;
  key: string;
}

export interface SchemaDeletionsAll {
  schemas: string[];
  action: MODIFICATION_ACTIONS.deleteAll;
}
