-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.department (
  department_id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_name character varying NOT NULL,
  CONSTRAINT department_pkey PRIMARY KEY (department_id)
);
CREATE TABLE public.division (
  division_id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid DEFAULT gen_random_uuid(),
  division_name character varying NOT NULL,
  CONSTRAINT division_pkey PRIMARY KEY (division_id),
  CONSTRAINT bidang_id_departement_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id)
);
CREATE TABLE public.hr_skill (
  hr_id uuid NOT NULL DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL,
  certificate_file text,
  CONSTRAINT hr_skill_pkey PRIMARY KEY (hr_id, skill_id),
  CONSTRAINT hr_skill_hr_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources(hr_id),
  CONSTRAINT hr_skill_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skill(skill_id)
);
CREATE TABLE public.human_resources (
  hr_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nip character varying NOT NULL,
  name character varying NOT NULL,
  phone_number character varying,
  address text,
  department_id uuid DEFAULT gen_random_uuid(),
  division_id uuid,
  section_id uuid,
  spv_id uuid,
  position_id uuid,
  contract_start_date date,
  contract_end_date date,
  CONSTRAINT human_resources_pkey PRIMARY KEY (hr_id),
  CONSTRAINT human_resources_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(department_id),
  CONSTRAINT human_resources_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division(division_id),
  CONSTRAINT human_resources_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.position(position_id),
  CONSTRAINT human_resources_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(section_id),
  CONSTRAINT human_resources_spv_id_fkey FOREIGN KEY (spv_id) REFERENCES public.human_resources(hr_id)
);
CREATE TABLE public.position (
  position_id uuid NOT NULL DEFAULT gen_random_uuid(),
  position_name character varying NOT NULL,
  CONSTRAINT position_pkey PRIMARY KEY (position_id)
);
CREATE TABLE public.role (
  role_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name character varying NOT NULL,
  CONSTRAINT role_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.section (
  section_id uuid NOT NULL DEFAULT gen_random_uuid(),
  division_id uuid,
  section_name character varying,
  CONSTRAINT section_pkey PRIMARY KEY (section_id),
  CONSTRAINT seksi_id_divison_fkey FOREIGN KEY (division_id) REFERENCES public.division(division_id)
);
CREATE TABLE public.skill (
  skill_id uuid NOT NULL DEFAULT gen_random_uuid(),
  skill_name character varying,
  CONSTRAINT skill_pkey PRIMARY KEY (skill_id)
);
CREATE TABLE public.user (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  role_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  image text,
  hr_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT user_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user(user_id),
  CONSTRAINT user_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_id_role_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id),
  CONSTRAINT user_hr_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources(hr_id)
);