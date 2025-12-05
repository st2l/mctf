export type DocumentProduct = {
  productId: string;
  count: number;
};

export type DocumentCreate = {
  name: string;
  note: string;
  items: DocumentProduct[];
};

export type DocumentDetails = {
  id: string;
  name: string;
  pdfPath: string;
  items: DocumentProduct[];
};

export type DocumentPublicRead = {
  documentId: string;
  password: string;
};

export type Document = {
  id: string;
  name: string;
  pdfPath: string;
};
