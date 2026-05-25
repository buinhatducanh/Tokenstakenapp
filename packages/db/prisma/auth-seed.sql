-- ORGANIZATION
INSERT INTO "Organization"
("id","name","slug","plan","settings","createdAt","updatedAt")
VALUES
('org_1','Tokens Taken','tokens-taken','FREE','{}',NOW(),NOW());

-- USERS
INSERT INTO "User"
("id","email","displayName","locale","timezone","createdAt","updatedAt")
VALUES
('user_1','admin@gmail.com','Admin','en','UTC',NOW(),NOW()),
('user_2','accountant@gmail.com','Accountant','en','UTC',NOW(),NOW()),
('user_3','viewer@gmail.com','Viewer','en','UTC',NOW(),NOW()),
('user_4','member@gmail.com','Member','en','UTC',NOW(),NOW()),
('user_5','owner@gmail.com','Owner','en','UTC',NOW(),NOW());

-- ORGANIZATION MEMBER (ROLE THẬT)
INSERT INTO "OrganizationMember"
("id","userId","organizationId","role","invitedAt","isActive")
VALUES
('member_1','user_1','org_1','ADMIN',NOW(),true),
('member_2','user_2','org_1','ACCOUNTANT',NOW(),true),
('member_3','user_3','org_1','VIEWER',NOW(),true),
('member_4','user_4','org_1','MEMBER',NOW(),true),
('member_5','user_5','org_1','OWNER',NOW(),true);

-- SESSION TEST
INSERT INTO "Session"
("id","userId","token","expiresAt","createdAt","lastActiveAt")
VALUES
('session_1','user_1','token_admin',NOW() + interval '7 day',NOW(),NOW()),
('session_2','user_2','token_accountant',NOW() + interval '7 day',NOW(),NOW()),
('session_3','user_3','token_viewer',NOW() + interval '7 day',NOW(),NOW()),
('session_4','user_4','token_member',NOW() + interval '7 day',NOW(),NOW()),
('session_5','user_5','token_owner',NOW() + interval '7 day',NOW(),NOW());