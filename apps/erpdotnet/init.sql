CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET search_path TO public;

CREATE TABLE companies (
    id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login      VARCHAR(255) NOT NULL UNIQUE,
    password   TEXT         NOT NULL,
    company_id UUID         NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_users_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE TABLE employees (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID         NOT NULL,
    login      VARCHAR(255) NOT NULL,
    password   TEXT         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    CONSTRAINT fk_employees_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_employees_company_login
    ON employees (company_id, login);

CREATE INDEX ix_employees_company_id
    ON employees (company_id);

CREATE TABLE products (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    description TEXT,
    price      DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    CONSTRAINT fk_products_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE INDEX ix_products_company_id
    ON products (company_id);

CREATE TABLE documents (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID         NOT NULL,
    name       VARCHAR(255) NOT NULL,
    pdf_path   TEXT         NOT NULL,
    password   VARCHAR(12),
    CONSTRAINT fk_documents_company
        FOREIGN KEY (company_id) REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE INDEX ix_documents_company_id
    ON documents (company_id);

CREATE TABLE document_products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    product_id  UUID NOT NULL,
    count       INTEGER NOT NULL CHECK (count > 0),
    CONSTRAINT fk_document_products_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_document_products_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_document_product UNIQUE (document_id, product_id)
);

CREATE INDEX ix_document_products_document_id
    ON document_products (document_id);

CREATE INDEX ix_document_products_product_id
    ON document_products (product_id);
