import { Annotation } from './parser';
import { BaseAnnotation } from './annotations/annotation_types';
export declare class ParameterParser {
    /**
     * Parses and checks the parameter. This is for backward compatibility and to support arbitrary annotation parameters
     * */
    static parseParameters(values: any[]): any;
}
/**
 * The annotation factory provides methods to create annotations. Those are stored temporarily
 * and than encoded into PDF code when the PDF document is written.
 * */
export declare class AnnotationFactory {
    private data;
    private userPassword;
    private ownerPassword;
    private annotations;
    private toDelete;
    private parser;
    constructor(data: Uint8Array, userPassword?: string, ownerPassword?: string);
    /**
     * Returns the number of annotations that will be added to the PDF document
     * */
    getAnnotationCount(): number;
    /**
     * Load a PDF file referenced by the given 'path'
     * */
    static loadFile(path: string, userPassword?: string, ownerPassword?: string): Promise<AnnotationFactory>;
    /**
     * Generates a unique identifier necessary for creating the annotation
     * */
    private generateUniqueIdentifier;
    /**
     * Generates a default border
     * */
    private createDefaultBorder;
    /**
     * Writes the created annotations into a bytestream
     * */
    write(): Uint8Array;
    /**
     * Checks the 'rect' parameter, whether all the entries are of type number and if the the number of entries is correct
     * */
    private checkRect;
    /**
     * Creates a base annotation that means the raw object of annotation or those parts that exist
     * in equal form in all types of annotations
     * */
    createBaseAnnotation(page: number): BaseAnnotation;
    /**
     * Creates a text annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * options : dictionary containing additional configuration values, see documentation
     * */
    createTextAnnotation(...values: any[]): void;
    /**
     * Creates a highlight annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * quadPoints : regions to mark with the highlight
     * */
    createHighlightAnnotation(...values: any[]): void;
    /**
     * Creates an underline annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * quadPoints : regions to mark with the highlight
     * */
    createUnderlineAnnotation(...values: any[]): void;
    /**
     * Creates a squiggle annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * quadPoints : regions to mark with the highlight
     * */
    createSquigglyAnnotation(...values: any[]): void;
    /**
     * Creates a strike out annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * quadPoints : regions to mark with the highlight
     * */
    createStrikeOutAnnotation(...values: any[]): void;
    /**
     * Creates a free text annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createFreeTextAnnotation(...values: any[]): void;
    createLineAnnotation(): void;
    /**
     * Creates a square annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * fill : the filling color of  the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createSquareAnnotation(...values: any[]): void;
    /**
     * Creates a circle annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * fill : the filling color of  the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createCircleAnnotation(...values: any[]): void;
    /**
     * Creates a polygon annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * vertices : the vertices defining the arrangement of the object
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createPolygonAnnotation(...values: any[]): void;
    /**
     * Creates a polyline annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * vertices : the vertices defining the arrangement of the object
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createPolyLineAnnotation(...values: any[]): void;
    /**
     * Creates an ink annotation
     * page : the number of the PDF document page, where the annotation must be attached
     * rect : the position of the annotation on the page
     * contents : the content of the annotation
     * author : the author of the annotation
     * inkList : a list of list containing the points for drawing the lines
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createInkAnnotation(...values: any[]): void;
    /**
     * Creates a stamp annotation. There exists a number of predifined stamps that can be attached to PDF documents.
     * page : the number of the PDF document page, where the annotation must be attached
     * contents : the content of the annotation
     * author : the author of the annotation
     * stampType : the name of the used stamp type. Can be: [Approved, Experimental, NotApproved, AsIs, Expired, NotForPublicRelease, Confidential, Final, Sold, Departmental, ForComment, TopSecret, Draft, ForPublicRelease]
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createStampAnnotation(...values: any[]): void;
    /**
     * Creates a visual symbol that indcates the existance of text edits.
     * page : the number of the PDF document page, where the annotation must be attached
     * contents : the content of the annotation
     * author : the author of the annotation
     * caretSymbol : None or P, with P for using the paragraph symbol as caret
     * color : the color of the annotation in rgb. Can be of domain 0 - 255 or 0 - 1
     * */
    createCaretAnnotation(...values: any[]): void;
    createPopupAnnotation(): void;
    /**
     * Deletes the annotation with the given id or the given reference object
     * */
    deleteAnnotation(id: any): Promise<any>;
    /**
     * Returns a promise with all the annotations that are part of the document. This
     * comprises annotations, that are already part of the parsed document and those that were created using this library and
     * not yet appended to the document.
     * */
    getAnnotations(): Promise<Annotation[][]>;
    /**
     * Downloads the adapted PDF document
     * */
    download(fileName?: string): void;
    /**
     * Get the adapted PDF document blob
     * */
    blob(): Blob;
    /**
     * Saves the adapted PDF document in a nodejs environment and downloads it in a browser environment.
     * */
    save(fileName?: string): void;
}
