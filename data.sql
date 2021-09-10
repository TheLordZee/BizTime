\c biztime

DROP TABLE IF EXISTS comp_inds;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;


CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE industries (
  in_code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE comp_inds (
  comp_code text REFERENCES companies ON DELETE CASCADE,
  ind_code text REFERENCES industries ON DELETE CASCADE,
  PRIMARY KEY (comp_code, ind_code)
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO industries
  VALUES('comm', 'Communications'),
        ('tech', 'Tech'),
        ('comp', 'Computers');

INSERT INTO comp_inds
  VALUES  ('apple', 'tech'),
          ('apple', 'comm'),
          ('ibm', 'tech'),
          ('ibm', 'comp');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);
