-- DROP SEQUENCE public.log_id_seq;

CREATE SEQUENCE public.log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.repository_id_seq;

CREATE SEQUENCE public.repository_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.user_id_seq;

CREATE SEQUENCE public.user_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id serial4 NOT NULL,
	username varchar NOT NULL,
	created timestamp NOT NULL,
	CONSTRAINT user_pk PRIMARY KEY (id),
	CONSTRAINT user_un UNIQUE (username)
);


-- public.log definition

-- Drop table

-- DROP TABLE public.log;

CREATE TABLE public.log (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	visited_endpoint varchar NOT NULL,
	created timestamp NOT NULL,
	CONSTRAINT log_pk PRIMARY KEY (id),
	CONSTRAINT log_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- public.repository definition

-- Drop table

-- DROP TABLE public.repository;

CREATE TABLE public.repository (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	name varchar NOT NULL,
	last_visited timestamp NOT NULL,
	visits_number int4 NOT NULL,
	created timestamp NOT NULL,
	CONSTRAINT repository_pk PRIMARY KEY (id),
	CONSTRAINT repository_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
