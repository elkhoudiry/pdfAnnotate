"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const object_util_1 = require("./object-util");
const document_history_1 = require("./document-history");
const crypto_1 = require("./crypto");
class _Annotation {
    constructor(data = new Uint8Array([]), cryptoInterface = new CryptoInterface()) {
        this.data = data;
        this.cryptoInterface = cryptoInterface;
        this.page = -1; // the target page of the annotation
        this.type = ""; // the sub type of the array (Text, Highlight, ...)
        this.object_id = undefined; // an unused object id
        this.id = ""; // unique annation identifier
        this.rect = []; // the location of the annotation
        this.author = ""; // the author of the annotation
        this.pageReference = undefined; // The reference to the page object to which the annotation is added
        this.updateDate = ""; // The date when the annotation was created or updated
        this.border = undefined; // define the border
        this.color = undefined; // the color set
        this.fill = undefined; // the fill color set
        this.data = data;
    }
    writeAnnotationPreamble() {
        throw Error("Error");
    }
    writeAnnotationPostamble() {
        throw Error("Error");
    }
    writeAnnotationObject(cryptoInterface) {
        throw Error("Error");
    }
    encodeAnnotationFlags() {
        if (!this.annotationFlags) {
            return 0;
        }
        let val = 0;
        if (this.annotationFlags.invisible) {
            val |= 1;
        }
        if (this.annotationFlags.hidden) {
            val |= 2;
        }
        if (this.annotationFlags.print) {
            val |= 4;
        }
        if (this.annotationFlags.noZoom) {
            val |= 8;
        }
        if (this.annotationFlags.noRotate) {
            val |= 16;
        }
        if (this.annotationFlags.noView) {
            val |= 32;
        }
        if (this.annotationFlags.readOnly) {
            val |= 64;
        }
        if (this.annotationFlags.locked) {
            val |= 128;
        }
        if (this.annotationFlags.toggleNoView) {
            val |= 256;
        }
        if (this.annotationFlags.lockedContents) {
            val |= 512;
        }
        return val;
    }
    /**
     * Extract the annotation object (partially)
     * */
    extract(xref, page, objectLookupTable) {
        let annot_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable);
        this.object_id = annot_obj.id;
        annot_obj = annot_obj.value;
        this.type = annot_obj["/Subtype"];
        this.rect = annot_obj["/Rect"];
        this.pageReference = page;
        if (annot_obj["/M"])
            this.updateDate = util_1.Util.convertUnicodeToString(this.cryptoInterface.decrypt(annot_obj["/M"], this.object_id));
        if (annot_obj["/Border"])
            this.border = annot_obj["/Border"];
        if (annot_obj["/C"])
            this.color = annot_obj["/C"];
        if (annot_obj["/T"])
            this.author = util_1.Util.convertUnicodeToString(this.cryptoInterface.decrypt(annot_obj["/T"], this.object_id));
        if (annot_obj["/NM"])
            this.id = util_1.Util.convertUnicodeToString(this.cryptoInterface.decrypt(annot_obj["/NM"], this.object_id));
        if (annot_obj["/Contents"])
            this.contents = util_1.Util.convertUnicodeToString(this.cryptoInterface.decrypt(annot_obj["/Contents"], this.object_id));
        if (annot_obj["/QuadPoints"])
            this.quadPoints = annot_obj["/QuadPoints"];
        if (annot_obj["/Inklist"])
            this.inkList = annot_obj["/Inklist"];
    }
}
exports._Annotation = _Annotation;
/**
 * Represents the Catalog object of the PDF document
 * */
class CatalogObject {
    /**
     * Extracts the data representing the object.
     * */
    constructor(data, xref, objectLookupTable) {
        this.data = data;
        this.xref = xref;
        this.objectLookupTable = objectLookupTable;
        this.pagesObjectId = { obj: -1, generation: -1 };
        this.data = data;
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable).value;
        if (page_obj["/Type"] !== "/Catalog")
            throw Error(`Invalid catalog object at position ${xref.pointer}`);
        this.pagesObjectId = page_obj["/Pages"];
    }
    getPagesObjectId() {
        return this.pagesObjectId;
    }
}
exports.CatalogObject = CatalogObject;
/**
 * Represents the PageTree object of the PDF document
 * This is the object with /Type /Pages
 * */
class PageTree {
    constructor(data, objectLookupTable) {
        this.data = data;
        this.objectLookupTable = objectLookupTable;
        this.pageCount = -1;
        this.pageReferences = [];
        this.visitedPages = [];
        this.data = data;
    }
    /**
     * Extracts the kids references recursively.
     * For every kid it checks if the referenced object type is:
     * - a /Pages object then it recursively lookups its children
     * - a /Page object then it adds the references
     * */
    extractPageReferences(references) {
        for (let reference of references) {
            if (this.visitedPages.some(el => el.obj === reference.obj &&
                el.generation === reference.generation)) {
                continue;
            }
            let xref = this.objectLookupTable[reference.obj];
            let kid_page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, this.objectLookupTable).value;
            if (kid_page_obj["/Type"] === "/Page") {
                this.pageReferences.push(reference);
            }
            else if (kid_page_obj["/Type"] === "/Pages") {
                this.visitedPages.push(reference);
                this.extractPageReferences(kid_page_obj["/Kids"]);
            }
            else {
                throw Error(`Invalid object type ${kid_page_obj["/Type"]}`);
            }
        }
    }
    /**
     * Extract the object data at the given pointer
     * */
    extract(xref, objectLookupTable) {
        let page_tree_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable).value;
        if (!page_tree_obj["/Kids"])
            throw Error(`Could not find index of /Kids in /Pages object`);
        let refs = page_tree_obj["/Kids"];
        this.pageReferences = [];
        this.extractPageReferences(refs);
        this.pageCount = this.pageReferences.length;
    }
    /**
     * Returns the number of pages the page tree comprises
     * */
    getPageCount() {
        return this.pageCount;
    }
    /**
     * Returns the reference to the page objects
     * */
    getPageReferences() {
        return this.pageReferences;
    }
}
exports.PageTree = PageTree;
/**
 * Represents a page object in the PDF document
 * */
class Page {
    constructor(data, documentHistory) {
        this.data = data;
        this.documentHistory = documentHistory;
        this.annots = [];
        this.hasAnnotsField = false;
        this.data = data;
    }
    /**
     * Extracts the references in the linked annotations array
     * */
    extractAnnotationArray() {
        let obj_table = this.documentHistory.createObjectLookupTable();
        if (!this.annotsPointer)
            throw Error("Annotations pointer not set");
        let ref_annot_table = obj_table[this.annotsPointer.obj];
        let annotations_obj = object_util_1.ObjectUtil.extractObject(this.data, ref_annot_table, obj_table);
        this.annots = annotations_obj.value;
    }
    /**
     * Extracts the page object starting at position ptr
     * */
    extract(xref, objectLookupTable) {
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, xref, objectLookupTable);
        this.object_id = page_obj.id;
        let annots = page_obj.value["/Annots"];
        if (annots) {
            this.hasAnnotsField = true;
            if (Array.isArray(annots)) {
                this.annots = annots.filter((x) => x !== 'null');
            }
            else {
                this.annotsPointer = annots;
                this.extractAnnotationArray();
            }
        }
    }
}
exports.Page = Page;
/**
 * Provides a configured interface to handle the encryption and decryption of PDFs
 * */
class CryptoInterface {
    constructor(data, documentHistory, ref_ptr, user_pwd, owner_pwd) {
        this.data = data;
        this.documentHistory = documentHistory;
        this.ref_ptr = ref_ptr;
        this.cryptoConfiguration = { version: undefined, revision: undefined, filter: undefined, user_pwd: "", owner_pwd: "", length: undefined, permissions: undefined, owner_pwd_c: undefined, user_pwd_c: undefined };
        this.cryptoEngine = new crypto_1.IdentityEngine();
        this.data = data;
        this.documentHistory = documentHistory;
        this.cryptoConfiguration.user_pwd = user_pwd ? user_pwd : "";
        this.cryptoConfiguration.owner_pwd = owner_pwd ? owner_pwd : "";
        if (this.ref_ptr && this.documentHistory) {
            this.extractEncryptionDictionary(this.ref_ptr);
            // setup crypto-engine
            if (this.cryptoConfiguration.version === 1) {
                this.cryptoEngine = new crypto_1.RC4CryptoEngine(this.cryptoConfiguration, this.documentHistory.getRecentUpdate().id, crypto_1.RC4_40_BIT);
            }
            else if (this.cryptoConfiguration.version === 2) {
                this.cryptoEngine = new crypto_1.RC4CryptoEngine(this.cryptoConfiguration, this.documentHistory.getRecentUpdate().id);
            }
            else if (this.cryptoConfiguration.version === 4) {
                console.log("Some fancy AES encryption");
            }
            else {
                throw Error(`Unsupported Encryption ${this.cryptoConfiguration.version}`);
            }
        }
    }
    /**
     * Returns the reference pointer
     * */
    getEncryptionDictReference() {
        if (!this.ref_ptr)
            return undefined;
        return { obj: this.ref_ptr.id, generation: this.ref_ptr.generation };
    }
    encrypt(data, reference) {
        return this.cryptoEngine.encrypt(data, reference);
    }
    decrypt(data, reference) {
        return this.cryptoEngine.decrypt(data, reference);
    }
    isUserPasswordCorrect() {
        if (!this.cryptoEngine) {
            throw Error("Crypto engine not configured");
        }
        return this.cryptoEngine.isUserPasswordCorrect();
    }
    isOwnerPasswordCorrect() {
        if (!this.cryptoEngine) {
            throw Error("Crypto engine not configured");
        }
        return this.cryptoEngine.isOwnerPasswordCorrect();
    }
    /**
     * Extracts the enrcyption dictionary
     * */
    extractEncryptionDictionary(ptr) {
        if (!this.documentHistory) {
            throw Error("Documenthistory not configured");
        }
        if (!this.data) {
            throw Error("Data not configured");
        }
        let obj_table = this.documentHistory.createObjectLookupTable();
        let page_obj = object_util_1.ObjectUtil.extractObject(this.data, ptr, obj_table);
        this.cryptoConfiguration.version = page_obj.value["/V"];
        this.cryptoConfiguration.revision = page_obj.value["/R"];
        this.cryptoConfiguration.filter = page_obj.value["/Filter"];
        this.cryptoConfiguration.user_pwd_c = page_obj.value["/U"];
        this.cryptoConfiguration.owner_pwd_c = page_obj.value["/O"];
        this.cryptoConfiguration.length = page_obj.value["/Length"];
        this.cryptoConfiguration.permissions = page_obj.value["/P"];
    }
}
exports.CryptoInterface = CryptoInterface;
/**
 * Parses the relevant parts of the PDF document and provides functionality to extract the necessary information for
 * adding annotations
 * */
class PDFDocumentParser {
    constructor(data, userpwd = "", ownerpwd = "") {
        this.data = data;
        this.version = undefined;
        this.documentHistory = new document_history_1.DocumentHistory(new Uint8Array([]));
        this.catalogObject = undefined;
        this.pageTree = undefined;
        this.cryptoInterface = new CryptoInterface();
        this.data = new Uint8Array(data);
        this.documentHistory = new document_history_1.DocumentHistory(this.data);
        this.documentHistory.extractDocumentHistory();
        if (this.documentHistory.isEncrypted()) {
            // extract encryption dictionary
            let obj_table = this.documentHistory.createObjectLookupTable();
            let enc_obj = this.documentHistory.getRecentUpdate().encrypt;
            if (!enc_obj)
                throw Error("Invalid encryption indication");
            let enc_obj_ptr = obj_table[enc_obj.obj];
            this.cryptoInterface = new CryptoInterface(this.data, this.documentHistory, enc_obj_ptr, userpwd, ownerpwd);
            // verify keys
            if (!this.cryptoInterface.isUserPasswordCorrect()) {
                if (!this.cryptoInterface.isOwnerPasswordCorrect()) {
                    throw Error("No valid user credentials");
                }
            }
        }
    }
    /**
     * Returns the crypto interface
     * */
    getCryptoInterface() {
        return this.cryptoInterface;
    }
    /**
     * Returns the major and minor version of the pdf document
     * */
    getPDFVersion() {
        if (this.version)
            return this.version;
        this.version = util_1.Util.extractVersion(this.data, 0);
        return this.version;
    }
    /**
     * Returns a free object id. It first checks wether there can be an freed object id reused. If that is not the case
     * it creates a new one
     * */
    getFreeObjectId() {
        return this.documentHistory.getFreeObjectId();
    }
    /**
     * Returns the catalog object of the PDF file
     * */
    getCatalog() {
        let recent_update = this.documentHistory.getRecentUpdate();
        if (recent_update.root) {
            let root_obj = recent_update.root;
            let obj_table = this.documentHistory.createObjectLookupTable();
            return new CatalogObject(this.data, obj_table[root_obj.obj], obj_table);
        }
        else { // If we do not know the catalogue object we need to look it up
            // In cross reference stream objects no /ROOT field is required, however often it is provided anyway
            // otherwise run this routine, but buffer the catalog object
            if (this.catalogObject)
                return this.catalogObject;
            throw Error("Does not work for compressed data");
            //let obj_table = this.documentHistory.createObjectLookupTable()
            //for (let i = 1; i < recent_update.size; ++i) {
            //    let _type = Util.extractField(this.data, Util._TYPE, obj_table[i].pointer)
            //    if (Util.areArraysEqual(_type, Util.CATALOG)) {
            //        this.catalogObject = new CatalogObject(this.data, obj_table[i])
            //        if (this.catalogObject)
            //            return this.catalogObject
            //    }
            //}
        }
        throw Error("Could not identify catalog object");
    }
    /**
     * Returns the latest version of the page tree object of the document
     * */
    getPageTree() {
        if (this.pageTree)
            return this.pageTree;
        let obj_table = this.documentHistory.createObjectLookupTable();
        let catalog_object = this.getCatalog();
        let pages_id = catalog_object.getPagesObjectId();
        let pages_ref = obj_table[pages_id.obj];
        let pageTree = new PageTree(this.data, obj_table);
        pageTree.extract(pages_ref, obj_table);
        this.pageTree = pageTree;
        return pageTree;
    }
    /**
     * Returns the latest version of the page with the given pageNumber
     * */
    getPage(pageNumber) {
        let pageTree = this.getPageTree();
        let pageId = pageTree.getPageReferences()[pageNumber];
        let obj_table = this.documentHistory.createObjectLookupTable();
        let obj_ptr = obj_table[pageId.obj];
        let page = new Page(this.data, this.documentHistory);
        page.extract(obj_ptr, obj_table);
        return page;
    }
    /**
     * Returns the annotations that exist in the document
     * */
    extractAnnotations() {
        let annots = [];
        let pt = this.getPageTree();
        let obj_table = this.documentHistory.createObjectLookupTable();
        let pageCount = pt.getPageCount();
        for (let i = 0; i < pageCount; ++i) {
            let page = this.getPage(i);
            let annotationReferences = page.annots;
            let pageAnnots = [];
            for (let refPtr of annotationReferences) {
                let a = new _Annotation(this.data, this.cryptoInterface);
                a.extract(obj_table[refPtr.obj], page, obj_table);
                a.page = i;
                pageAnnots.push(a);
            }
            annots.push(pageAnnots);
        }
        return annots;
    }
}
exports.PDFDocumentParser = PDFDocumentParser;
//# sourceMappingURL=parser.js.map