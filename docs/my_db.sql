-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.approval (
  approval_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cr_id uuid,
  stage character varying NOT NULL,
  approver_id uuid NOT NULL,
  decision character varying,
  note character varying,
  decided_at timestamp with time zone,
  pj_id uuid,
  CONSTRAINT approval_pkey PRIMARY KEY (approval_id),
  CONSTRAINT approval_cr_id_fkey FOREIGN KEY (cr_id) REFERENCES public.change_request(cr_id),
  CONSTRAINT approval_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.user_clone(user_id),
  CONSTRAINT approval_pj_id_fkey FOREIGN KEY (pj_id) REFERENCES public.patch_job(job_id)
);
CREATE TABLE public.asset_non_ti (
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  asset_name character varying NOT NULL,
  asset_type character varying,
  merk_type character varying,
  spesification character varying,
  version character varying,
  serial_number character varying,
  location character varying,
  status character varying,
  parent_id uuid DEFAULT gen_random_uuid(),
  division_id uuid,
  section_id uuid,
  department_id uuid,
  last_seen_at timestamp with time zone,
  CONSTRAINT asset_non_ti_pkey PRIMARY KEY (asset_id),
  CONSTRAINT asset_non_ti_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.asset_non_ti(asset_id),
  CONSTRAINT asset_non_ti_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division_clone(division_id),
  CONSTRAINT asset_non_ti_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section_clone(section_id),
  CONSTRAINT asset_non_ti_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id)
);
CREATE TABLE public.audit_trail (
  audit_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  ci_id uuid,
  action character varying,
  details character varying,
  location character varying,
  before character varying,
  after character varying,
  created_at timestamp without time zone NOT NULL,
  CONSTRAINT audit_trail_pkey PRIMARY KEY (audit_id),
  CONSTRAINT audit_trail_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_clone(user_id),
  CONSTRAINT audit_trail_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id)
);
CREATE TABLE public.change_request (
  cr_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  change_type character varying,
  risk_score real NOT NULL DEFAULT '0'::real,
  impact_desc character varying,
  rollback_plan character varying,
  status character varying NOT NULL,
  requester_id uuid NOT NULL,
  department_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  prob_score real NOT NULL DEFAULT '0'::real,
  impact_score real NOT NULL DEFAULT '0'::real,
  exposure_score real NOT NULL DEFAULT '0'::real,
  detail_cost character varying,
  estimated_duration character varying,
  emergency boolean,
  total_cost character varying,
  reason_change character varying,
  pic_before uuid,
  ticket_id uuid,
  purpose_change character varying,
  change_level character varying,
  schedule_start timestamp without time zone,
  schedule_end timestamp without time zone,
  attachment character varying,
  implementation_plan character varying,
  pic_after uuid,
  metadata jsonb,
  CONSTRAINT change_request_pkey PRIMARY KEY (cr_id),
  CONSTRAINT change_request_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.user_clone(user_id),
  CONSTRAINT change_request_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id),
  CONSTRAINT change_request_pic_after_fkey FOREIGN KEY (pic_after) REFERENCES public.user_clone(user_id),
  CONSTRAINT change_request_pic_before_fkey FOREIGN KEY (pic_before) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.change_request_ci (
  cr_ci_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cr_id uuid NOT NULL,
  ci_before_id uuid,
  impact_score integer,
  risk_level character varying,
  final_risk_score integer,
  exposure_score integer,
  prob_score integer,
  status character varying,
  ci_after_id uuid,
  ci_before_data jsonb,
  asset_before_id uuid,
  asset_after_id uuid,
  asset_before_data jsonb,
  hr_id uuid,
  CONSTRAINT change_request_ci_pkey PRIMARY KEY (cr_ci_id),
  CONSTRAINT change_request_ci_cr_id_fkey FOREIGN KEY (cr_id) REFERENCES public.change_request(cr_id),
  CONSTRAINT change_request_ci_ci_after_id_fkey FOREIGN KEY (ci_after_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT change_request_ci_ci_before_id_fkey FOREIGN KEY (ci_before_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT change_request_ci_asset_before_id_fkey FOREIGN KEY (asset_before_id) REFERENCES public.asset_non_ti(asset_id),
  CONSTRAINT change_request_ci_asset_after_id_fkey FOREIGN KEY (asset_after_id) REFERENCES public.asset_non_ti(asset_id),
  CONSTRAINT change_request_ci_hr_before_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources_clone(hr_id),
  CONSTRAINT change_request_ci_hr_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources_clone(hr_id)
);
CREATE TABLE public.change_request_result (
  cr_result_id uuid NOT NULL DEFAULT gen_random_uuid(),
  cr_id uuid NOT NULL,
  execution_date_start timestamp without time zone NOT NULL,
  execution_date_end timestamp without time zone NOT NULL,
  notes character varying,
  evidence character varying,
  upload_by uuid NOT NULL,
  upload_at timestamp without time zone NOT NULL,
  CONSTRAINT change_request_result_pkey PRIMARY KEY (cr_result_id),
  CONSTRAINT change_request_result_cr_id_fkey FOREIGN KEY (cr_id) REFERENCES public.change_request(cr_id),
  CONSTRAINT change_request_result_upload_by_fkey FOREIGN KEY (upload_by) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.ci_relation (
  cir_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source_ci_id uuid NOT NULL,
  target_ci_id uuid NOT NULL,
  relation_type character varying NOT NULL,
  CONSTRAINT ci_relation_pkey PRIMARY KEY (cir_id),
  CONSTRAINT ci_relation_source_ci_id_fkey FOREIGN KEY (source_ci_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT ci_relation_target_ci_id_fkey FOREIGN KEY (target_ci_id) REFERENCES public.configuration_item(ci_id)
);
CREATE TABLE public.config_version (
  cv_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ci_id uuid,
  version_no character varying NOT NULL,
  changed_at timestamp without time zone DEFAULT now(),
  diff_json jsonb,
  changed_by uuid NOT NULL,
  CONSTRAINT config_version_pkey PRIMARY KEY (cv_id),
  CONSTRAINT config_version_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT config_version_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.configuration_item (
  ci_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ci_type character varying NOT NULL,
  ci_name character varying NOT NULL,
  serial_number character varying,
  hostname character varying,
  ip_address character varying,
  location character varying NOT NULL,
  status character varying,
  os character varying DEFAULT NULL::character varying,
  version character varying DEFAULT NULL::character varying,
  last_seen_at timestamp without time zone DEFAULT now(),
  incident_count integer,
  merk_type character varying,
  pic character varying,
  parent_id uuid DEFAULT gen_random_uuid(),
  specification character varying,
  division_id uuid,
  section_id uuid,
  department_id uuid,
  created_at timestamp with time zone,
  CONSTRAINT configuration_item_pkey PRIMARY KEY (ci_id),
  CONSTRAINT configuration_item_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT configuration_item_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division_clone(division_id),
  CONSTRAINT configuration_item_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section_clone(section_id),
  CONSTRAINT configuration_item_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id)
);
CREATE TABLE public.department_clone (
  department_id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_name character varying NOT NULL UNIQUE,
  CONSTRAINT department_clone_pkey PRIMARY KEY (department_id)
);
CREATE TABLE public.division_clone (
  division_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  division_name character varying NOT NULL,
  department_id uuid NOT NULL,
  CONSTRAINT division_clone_pkey PRIMARY KEY (division_id),
  CONSTRAINT division_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id)
);
CREATE TABLE public.hr_skill_clone (
  hr_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  certificate_file text,
  CONSTRAINT hr_skill_clone_pkey PRIMARY KEY (hr_id, skill_id),
  CONSTRAINT hr_skill_hr_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources_clone(hr_id),
  CONSTRAINT hr_skill_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skill_clone(skill_id)
);
CREATE TABLE public.human_resources_clone (
  hr_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nip character varying NOT NULL,
  name character varying NOT NULL,
  phone_number character varying,
  address character varying,
  spv_id uuid,
  section_id uuid,
  division_id uuid,
  department_id uuid,
  position_id uuid DEFAULT gen_random_uuid(),
  contract_start_date date,
  contract_end_date date,
  CONSTRAINT human_resources_clone_pkey PRIMARY KEY (hr_id),
  CONSTRAINT human_resources_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section_clone(section_id),
  CONSTRAINT human_resources_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division_clone(division_id),
  CONSTRAINT human_resources_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id),
  CONSTRAINT human_resources_clone_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.position_clone(position_id),
  CONSTRAINT human_resources_clone_spv_id_fkey FOREIGN KEY (spv_id) REFERENCES public.human_resources_clone(hr_id)
);
CREATE TABLE public.incident_clone (
  incident_id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_name character varying,
  incident_code character varying,
  asset_category character varying,
  ci_id uuid DEFAULT gen_random_uuid(),
  asset_id uuid DEFAULT gen_random_uuid(),
  incident_category character varying,
  incident_priority_level character varying NOT NULL,
  urgency character varying,
  incident_description text,
  impact character varying,
  incident_location character varying,
  date_request timestamp with time zone,
  incident_attachment character varying,
  CONSTRAINT incident_clone_pkey PRIMARY KEY (incident_id),
  CONSTRAINT incident_clone_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT incident_clone_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_non_ti(asset_id)
);
CREATE TABLE public.notification (
  notif_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  type character varying NOT NULL,
  sent_at timestamp without time zone,
  read_at timestamp without time zone,
  recipient_id uuid NOT NULL,
  recipient_ids jsonb,
  CONSTRAINT notification_pkey PRIMARY KEY (notif_id),
  CONSTRAINT notification_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.patch_job (
  job_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying,
  description character varying,
  patch_id uuid DEFAULT gen_random_uuid(),
  schedule_at timestamp without time zone,
  status character varying,
  pic uuid,
  created_by uuid,
  ticket_id uuid,
  impact_score real,
  prob_score real,
  exposure_score real,
  risk_level character varying,
  pj_risk_score real,
  deadline timestamp without time zone,
  created_at timestamp without time zone,
  detail_cost character varying,
  total_cost character varying,
  compliance_rate real,
  mttp real,
  target_description text,
  CONSTRAINT patch_job_pkey PRIMARY KEY (job_id),
  CONSTRAINT patch_job_technician_id_fkey FOREIGN KEY (pic) REFERENCES public.user_clone(user_id),
  CONSTRAINT patch_job_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_clone(user_id),
  CONSTRAINT patch_job_patch_id_fkey FOREIGN KEY (patch_id) REFERENCES public.configuration_item(ci_id)
);
CREATE TABLE public.patch_job_result (
  patch_result_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ci_id uuid,
  job_id uuid,
  execution_date_start timestamp with time zone,
  execution_date_finished timestamp with time zone,
  evidence character varying,
  message character varying,
  result character varying,
  upload_at timestamp with time zone NOT NULL DEFAULT now(),
  upload_by uuid,
  code character varying,
  CONSTRAINT patch_job_result_pkey PRIMARY KEY (patch_result_id),
  CONSTRAINT patch_job_result_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT patch_job_result_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.patch_job(job_id),
  CONSTRAINT patch_job_result_upload_by_fkey FOREIGN KEY (upload_by) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.position_clone (
  position_id uuid NOT NULL DEFAULT gen_random_uuid(),
  position_name character varying NOT NULL,
  CONSTRAINT position_clone_pkey PRIMARY KEY (position_id)
);
CREATE TABLE public.risk_clone (
  risk_id uuid NOT NULL DEFAULT gen_random_uuid(),
  risk_title character varying NOT NULL,
  risk_type character varying,
  scenario_id uuid,
  impact character varying,
  impact_score integer DEFAULT 0,
  probability integer DEFAULT 0,
  cause character varying,
  risk_description character varying,
  entry_level integer,
  priority character varying,
  criteria character varying,
  status character varying,
  ci_id uuid,
  asset_id uuid,
  CONSTRAINT risk_clone_pkey PRIMARY KEY (risk_id),
  CONSTRAINT risk_clone_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.scenario_clone(scenario_id),
  CONSTRAINT risk_clone_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT risk_clone_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_non_ti(asset_id)
);
CREATE TABLE public.role_clone (
  role_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  role_name character varying NOT NULL UNIQUE,
  CONSTRAINT role_clone_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.scenario_clone (
  scenario_id uuid NOT NULL DEFAULT gen_random_uuid(),
  scenario_name character varying NOT NULL,
  description text,
  asset_id uuid,
  ci_id uuid,
  CONSTRAINT scenario_clone_pkey PRIMARY KEY (scenario_id),
  CONSTRAINT scenario_clone_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_non_ti(asset_id),
  CONSTRAINT scenario_clone_ci_id_fkey FOREIGN KEY (ci_id) REFERENCES public.configuration_item(ci_id)
);
CREATE TABLE public.section_clone (
  section_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_name character varying NOT NULL,
  division_id uuid NOT NULL,
  CONSTRAINT section_clone_pkey PRIMARY KEY (section_id),
  CONSTRAINT section_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.division_clone(division_id)
);
CREATE TABLE public.skill_clone (
  skill_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  skill_name character varying NOT NULL UNIQUE,
  CONSTRAINT skill_clone_pkey PRIMARY KEY (skill_id)
);
CREATE TABLE public.target_group (
  ci_target_id uuid NOT NULL,
  patch_id uuid NOT NULL,
  job_id uuid NOT NULL,
  target_group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid,
  assigned_technician uuid,
  CONSTRAINT target_group_pkey PRIMARY KEY (target_group_id),
  CONSTRAINT target_group_ci_target_id_fkey FOREIGN KEY (ci_target_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT target_group_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.patch_job(job_id),
  CONSTRAINT target_group_patch_id_fkey FOREIGN KEY (patch_id) REFERENCES public.configuration_item(ci_id),
  CONSTRAINT target_group_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department_clone(department_id),
  CONSTRAINT target_group_assigned_technician_fkey FOREIGN KEY (assigned_technician) REFERENCES public.user_clone(user_id)
);
CREATE TABLE public.user_clone (
  user_id uuid NOT NULL UNIQUE,
  name character varying NOT NULL,
  role_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  created_by uuid,
  email character varying NOT NULL UNIQUE,
  password character varying,
  last_sign_in timestamp without time zone,
  updated_at timestamp without time zone,
  hr_id uuid,
  CONSTRAINT user_clone_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role_clone(role_id),
  CONSTRAINT user_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_clone(user_id),
  CONSTRAINT user_clone_hr_id_fkey FOREIGN KEY (hr_id) REFERENCES public.human_resources_clone(hr_id)
);