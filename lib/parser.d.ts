import { PDFVersion } from './util';
import { DocumentHistory, ObjectLookupTable, XRef } from './document-history';
import { CryptoEngine, CryptoConfiguration } from './crypto';
import { AnnotationFlags, Border, Color } from './annotations/annotation_types';
import { TextAnnotationObj } from './annotations/text_annotation';
import { HighlightAnnotationObj } from './annotations/text_markup_annotation';
import { FreeTextAnnotationObj } from './annotations/freetext_annotation';
import { SquareAnnotationObj, CircleAnnotationObj } from './annotations/circle_square_annotation';
import { PolygonAnnotationObj, PolyLineAnnotationObj } from './annotations/polygon_polyline_annotation';
import { InkAnnotationObj } from './annotations/ink_annotation';
/**
 * Note that this parser does not parses the PDF file completely. It lookups those
 * parts that are important for the creation of annotations. For more information
 * please read the README.
 * */
/**
 * References in PDF documens are  of the form
 * <obj_id> <generation> R
 *
 * This holds such a reference
 * */
export interface ReferencePointer {
    obj: number;
    generation: number;
    reused?: boolean | undefined;
}
export declare type Annotation = _Annotation | TextAnnotationObj | HighlightAnnotationObj | FreeTextAnnotationObj | SquareAnnotationObj | CircleAnnotationObj | PolygonAnnotationObj | PolyLineAnnotationObj | InkAnnotationObj;
export declare class _Annotation {
    private data;
    private cryptoInterface;
    page: number;
    type: string;
    object_id: ReferencePointer | undefined;
    id: string;
    rect: number[];
    author: string;
    pageReference: Page | undefined;
    updateDate: string;
    contents?: string;
    annotationFlags?: AnnotationFlags;
    appearance_dictionary?: any;
    appearance_state?: any;
    border?: Border | undefined;
    color?: Color | undefined;
    fill?: Color | undefined;
    opacity?: number;
    richtext?: string;
    initiallyOpen?: boolean;
    iconName?: string;
    annotationState?: string;
    stateModel?: string;
    defaultAppearance?: string;
    textAlignment?: string;
    richTextString?: string;
    calloutLine?: number[];
    intent?: string;
    borderEffect?: any;
    rd?: any;
    borderStyle?: any;
    lineEnding?: string;
    stampType?: string;
    caretSymbol?: string;
    quadPoints?: number[];
    inkList?: number[][];
    border_style?: any;
    color_space?: number[];
    border_effect?: any;
    vertices?: number[];
    line_ending?: string[];
    interior_color?: number[];
    measure?: any;
    is_deleted?: boolean;
    writeAnnotationPreamble(): number[];
    writeAnnotationPostamble(): number[];
    writeAnnotationObject(cryptoInterface: CryptoInterface): number[];
    encodeAnnotationFlags(): number;
    constructor(data?: Uint8Array, cryptoInterface?: CryptoInterface);
    /**
     * Extract the annotation object (partially)
     * */
    extract(xref: XRef, page: Page, objectLookupTable: ObjectLookupTable): void;
}
/**
 * Represents the Catalog object of the PDF document
 * */
export declare class CatalogObject {
    private data;
    private xref;
    private objectLookupTable;
    /**
     * Extracts the data representing the object.
     * */
    constructor(data: Uint8Array, xref: XRef, objectLookupTable: ObjectLookupTable);
    private pagesObjectId;
    getPagesObjectId(): ReferencePointer;
}
/**
 * Represents the PageTree object of the PDF document
 * This is the object with /Type /Pages
 * */
export declare class PageTree {
    private data;
    private objectLookupTable;
    private pageCount;
    private pageReferences;
    private visitedPages;
    constructor(data: Uint8Array, objectLookupTable: ObjectLookupTable);
    /**
     * Extracts the kids references recursively.
     * For every kid it checks if the referenced object type is:
     * - a /Pages object then it recursively lookups its children
     * - a /Page object then it adds the references
     * */
    extractPageReferences(references: ReferencePointer[]): void;
    /**
     * Extract the object data at the given pointer
     * */
    extract(xref: XRef, objectLookupTable: ObjectLookupTable): void;
    /**
     * Returns the number of pages the page tree comprises
     * */
    getPageCount(): number;
    /**
     * Returns the reference to the page objects
     * */
    getPageReferences(): ReferencePointer[];
}
/**
 * Represents a page object in the PDF document
 * */
export declare class Page {
    private data;
    private documentHistory;
    object_id: ReferencePointer | undefined;
    annots: ReferencePointer[];
    hasAnnotsField: boolean;
    annotsPointer: ReferencePointer | undefined;
    constructor(data: Uint8Array, documentHistory: DocumentHistory);
    /**
     * Extracts the references in the linked annotations array
     * */
    extractAnnotationArray(): void;
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref: XRef, objectLookupTable: ObjectLookupTable): void;
}
/**
 * Provides a configured interface to handle the encryption and decryption of PDFs
 * */
export declare class CryptoInterface {
    private data?;
    private documentHistory?;
    private ref_ptr?;
    cryptoConfiguration: CryptoConfiguration;
    cryptoEngine: CryptoEngine;
    constructor(data?: Uint8Array | undefined, documentHistory?: DocumentHistory | undefined, ref_ptr?: XRef | undefined, user_pwd?: string, owner_pwd?: string);
    /**
     * Returns the reference pointer
     * */
    getEncryptionDictReference(): ReferencePointer | undefined;
    encrypt(data: Uint8Array, reference: ReferencePointer | undefined): Uint8Array;
    decrypt(data: Uint8Array, reference: ReferencePointer | undefined): Uint8Array;
    isUserPasswordCorrect(): boolean;
    isOwnerPasswordCorrect(): boolean;
    /**
     * Extracts the enrcyption dictionary
     * */
    extractEncryptionDictionary(ptr: XRef): void;
}
/**
 * Parses the relevant parts of the PDF document and provides functionality to extract the necessary information for
 * adding annotations
 * */
export declare class PDFDocumentParser {
    private data;
    private version;
    documentHistory: DocumentHistory;
    private catalogObject;
    private pageTree;
    private cryptoInterface;
    constructor(data: Uint8Array, userpwd?: string, ownerpwd?: string);
    /**
     * Returns the crypto interface
     * */
    getCryptoInterface(): CryptoInterface;
    /**
     * Returns the major and minor version of the pdf document
     * */
    getPDFVersion(): PDFVersion;
    /**
     * Returns a free object id. It first checks wether there can be an freed object id reused. If that is not the case
     * it creates a new one
     * */
    getFreeObjectId(): ReferencePointer;
    /**
     * Returns the catalog object of the PDF file
     * */
    getCatalog(): CatalogObject;
    /**
     * Returns the latest version of the page tree object of the document
     * */
    getPageTree(): PageTree;
    /**
     * Returns the latest version of the page with the given pageNumber
     * */
    getPage(pageNumber: number): Page;
    /**
     * Returns the annotations that exist in the document
     * */
    extractAnnotations(): Annotation[][];
}
