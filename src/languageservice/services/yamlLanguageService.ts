/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DocumentSymbolsContext } from 'vscode-json-languageservice';
import {
  CodeActionParams,
  DefinitionParams,
  DocumentOnTypeFormattingParams,
  PrepareRenameParams,
  RenameParams,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CodeAction,
  CodeLens,
  CompletionList,
  DefinitionLink,
  Diagnostic,
  DocumentLink,
  DocumentSymbol,
  FoldingRange,
  Hover,
  Position,
  Range,
  SelectionRange,
  SymbolInformation,
  TextEdit,
  WorkspaceEdit,
} from 'vscode-languageserver-types';
import { JSONSchema } from '../jsonSchema';
import { YamlVersion } from '../parser/yamlParser07';
import { CustomSchemaProvider, SchemaAdditions, SchemaDeletions, SchemaDeletionsAll } from '../services/yamlSchemaService';
import { FoldingRangesContext, SchemaVersions } from '../yamlTypes';

export enum SchemaPriority {
  SchemaStore = 1,
  SchemaAssociation = 2,
  Settings = 3,
}

export interface SchemasSettings {
  priority?: SchemaPriority; // Priority represents the order in which schemas are selected. If multiple schemas match a yaml document then highest priority wins
  fileMatch: string[];
  schema?: unknown;
  uri: string;
  name?: string;
  description?: string;
  versions?: SchemaVersions;
}

export interface LanguageSettings {
  validate?: boolean; //Setting for whether we want to validate the schema
  hover?: boolean; //Setting for whether we want to have hover results
  hoverAnchor?: boolean; //Setting for whether we want to have hover anchor results
  completion?: boolean; //Setting for whether we want to have completion results
  format?: boolean; //Setting for whether we want to have the formatter or not
  isKubernetes?: boolean; //If true then its validating against kubernetes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas?: SchemasSettings[]; //List of schemas,
  customTags?: Array<string>; //Array of Custom Tags
  /**
   * Default indentation size
   */
  indentation?: string;

  /**
   * Globally set additionalProperties to false if additionalProperties is not set and if schema.type is object.
   * So if its true, no extra properties are allowed inside yaml.
   */
  disableAdditionalProperties?: boolean;

  /**
   * Disable adding not required properties with default values into completion text.
   */
  disableDefaultProperties?: boolean;

  /**
   * If true, the user must select some parent skeleton first before autocompletion starts to suggest the rest of the properties.
   * When yaml object is not empty, autocompletion ignores this setting and returns all properties and skeletons.
   */
  parentSkeletonSelectedFirst?: boolean;

  /**
   * Default yaml lang version
   */
  yamlVersion?: YamlVersion;

  /**
   * Control the use of flow mappings. Default is allow.
   */
  flowMapping?: 'allow' | 'forbid';
  /**
   * Control the use of flow sequences. Default is allow.
   */
  flowSequence?: 'allow' | 'forbid';
  /**
   * If set enforce alphabetical ordering of keys in mappings.
   */
  keyOrdering?: boolean;
}

export interface WorkspaceContextService {
  resolveRelativePath(relativePath: string, resource: string): string;
}
/**
 * The schema request service is used to fetch schemas. The result should the schema file comment, or,
 * in case of an error, a displayable error string
 */
export interface SchemaRequestService {
  (uri: string): Promise<string>;
}

export interface SchemaConfiguration {
  /**
   * The URI of the schema, which is also the identifier of the schema.
   */
  uri: string;
  /**
   * A list of file names that are associated to the schema. The '*' wildcard can be used. For example '*.schema.json', 'package.json'
   */
  fileMatch?: string[];
  /**
   * The schema for the given URI.
   * If no schema is provided, the schema will be fetched with the schema request service (if available).
   */
  schema?: JSONSchema;
}

export interface CustomFormatterOptions {
  singleQuote?: boolean;
  bracketSpacing?: boolean;
  trailingComma?: boolean;
  proseWrap?: string;
  printWidth?: number;
  enable?: boolean;
}

export interface LanguageService {
  configure: (settings: LanguageSettings) => void;
  registerCustomSchemaProvider: (schemaProvider: CustomSchemaProvider) => void;
  doComplete: (document: TextDocument, position: Position, isKubernetes: boolean) => Promise<CompletionList>;
  doValidation: (document: TextDocument, isKubernetes: boolean) => Promise<Diagnostic[]>;
  doHover: (document: TextDocument, position: Position) => Promise<Hover | null>;
  findDocumentSymbols: (document: TextDocument, context?: DocumentSymbolsContext) => SymbolInformation[];
  findDocumentSymbols2: (document: TextDocument, context?: DocumentSymbolsContext) => DocumentSymbol[];
  findLinks: (document: TextDocument) => Promise<DocumentLink[]>;
  resetSchema: (uri: string) => boolean;
  doFormat: (document: TextDocument, options?: CustomFormatterOptions) => Promise<TextEdit[]>;
  doDefinition: (document: TextDocument, params: DefinitionParams) => DefinitionLink[] | undefined;
  doDocumentOnTypeFormatting: (document: TextDocument, params: DocumentOnTypeFormattingParams) => TextEdit[] | undefined;
  addSchema: (schemaID: string, schema: JSONSchema) => void;
  deleteSchema: (schemaID: string) => void;
  modifySchemaContent: (schemaAdditions: SchemaAdditions) => void;
  deleteSchemaContent: (schemaDeletions: SchemaDeletions) => void;
  deleteSchemasWhole: (schemaDeletions: SchemaDeletionsAll) => void;
  getFoldingRanges: (document: TextDocument, context: FoldingRangesContext) => FoldingRange[] | null;
  getSelectionRanges: (document: TextDocument, positions: Position[]) => SelectionRange[];
  getCodeAction: (document: TextDocument, params: CodeActionParams) => CodeAction[] | undefined;
  getCodeLens: (document: TextDocument) => PromiseLike<CodeLens[] | undefined> | CodeLens[] | undefined;
  resolveCodeLens: (param: CodeLens) => PromiseLike<CodeLens> | CodeLens;
  prepareRename: (document: TextDocument, params: PrepareRenameParams) => Range | null;
  doRename: (document: TextDocument, params: RenameParams) => WorkspaceEdit | null;
}
