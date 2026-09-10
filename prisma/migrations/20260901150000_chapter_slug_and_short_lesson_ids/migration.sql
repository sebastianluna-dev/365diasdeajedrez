-- Chapter slug, and short lesson identifiers for the URL.
--
-- The lesson renames are NOT random: the imported course's ids are derived from
-- each lesson's `stableKey`, so the old→new mapping was computed with the same
-- hash prisma/seed-courses/think-like-a-grandmaster.ts uses. If they were
-- random, the next seed would not find the rows and would duplicate them.
--
-- Renaming Lesson's primary key is safe because everything pointing at it is
-- ON UPDATE CASCADE: TrainingExercise, LessonTopic, LessonProgress,
-- CourseProgress.lastLessonId and ClassBlock.lessonId.

ALTER TABLE "Chapter" ADD COLUMN "slug" TEXT;

UPDATE "Chapter" SET slug = 'analisis-de-variantes' WHERE id = 'c1000000-0000-4000-8000-000000000010';
UPDATE "Chapter" SET slug = 'juicio-posicional' WHERE id = 'c1000000-0000-4000-8000-000000000011';
UPDATE "Chapter" SET slug = 'planeamiento' WHERE id = 'c1000000-0000-4000-8000-000000000012';
UPDATE "Chapter" SET slug = 'el-final' WHERE id = 'c1000000-0000-4000-8000-000000000013';
UPDATE "Chapter" SET slug = 'un-conocimiento-del-jugador' WHERE id = 'c1000000-0000-4000-8000-000000000014';
UPDATE "Chapter" SET slug = 'ideas-basicas' WHERE id = 'c1000000-0000-4000-8000-000000000001';
UPDATE "Chapter" SET slug = 'la-variante-najdorf' WHERE id = 'c1000000-0000-4000-8000-000000000002';
UPDATE "Chapter" SET slug = 'posiciones-fundamentales' WHERE id = 'c1000000-0000-4000-8000-000000000003';

-- Any chapter that does not come from the seed: derived from the name.
UPDATE "Chapter" SET slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) WHERE slug IS NULL;
UPDATE "Chapter" SET slug = 'capitulo-' || "order" WHERE slug IS NULL OR slug = '';

ALTER TABLE "Chapter" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Chapter_courseId_slug_key" ON "Chapter"("courseId", "slug");

UPDATE "Lesson" SET id = 'iCqKMoNH' WHERE id = '9ebc2a0a-88e2-5707-8940-ccf0f9ea52b3';
UPDATE "Lesson" SET id = 'r201kNOa' WHERE id = '2bb272b1-624b-5c58-b157-07a9e9086d2a';
UPDATE "Lesson" SET id = 'k6E8YsI5' WHERE id = '62b6fcb8-d26a-52b5-b718-a9c919ab7da9';
UPDATE "Lesson" SET id = 'X14ju2jc' WHERE id = '173576dd-2ef0-5d1c-979e-f265066d7866';
UPDATE "Lesson" SET id = 'aYFRdRQc' WHERE id = '1a9405cb-1d4f-505a-be58-2cf08060b918';
UPDATE "Lesson" SET id = 'lyDa7PYs' WHERE id = '25ec0396-3b8b-52e6-9b59-924c7650db9c';
UPDATE "Lesson" SET id = 'MKPXpOs5' WHERE id = '4a86c917-a50e-5a39-93b0-c6657206d6dd';
UPDATE "Lesson" SET id = 'GCcrUcrh' WHERE id = '067e1c2b-145a-559d-b198-a5b4838b843d';
UPDATE "Lesson" SET id = 'To2HfheO' WHERE id = '13e2f0ff-9b9d-5cc8-ad32-2bb7d96ebf27';
UPDATE "Lesson" SET id = 'Y2dW91VQ' WHERE id = '56361d54-3d73-51ca-97d1-6a22dedd8494';
UPDATE "Lesson" SET id = '9aAISUb6' WHERE id = 'b9587cc2-cc90-5578-b129-e54cd8696ee9';
UPDATE "Lesson" SET id = 'iCoaIeA7' WHERE id = 'dc7ee2d4-085c-5eb7-ac49-c1e0a2c4f7b7';
UPDATE "Lesson" SET id = 'sWfBTIkY' WHERE id = 'e6549b3f-51c2-5218-abd9-08de997edff9';
UPDATE "Lesson" SET id = 'JED5tt5a' WHERE id = '09040377-2da9-59d4-b458-1aaaeb5d734a';
UPDATE "Lesson" SET id = 'L9K806yZ' WHERE id = '49b90a7a-ee78-5e57-b57b-5d91bd49dde4';
UPDATE "Lesson" SET id = 'RVrDWmPW' WHERE id = '1153e503-d026-5d54-9d1b-4f9b0563ddd8';
UPDATE "Lesson" SET id = 'A9TJtwOF' WHERE id = '3ef78fc3-a9ac-5e05-a72a-26dd5f93e357';
UPDATE "Lesson" SET id = 'eKmCeyfK' WHERE id = '1e48e07e-9aae-5d86-b77f-de4b36f9f724';
UPDATE "Lesson" SET id = '4rQEGEJN' WHERE id = '762b10be-fe42-53c7-876c-fdb0f5125c83';
UPDATE "Lesson" SET id = 'GgDSNpGJ' WHERE id = '82dafbcc-4ba5-5047-8376-eb519bf41261';
UPDATE "Lesson" SET id = '7yOlDbE0' WHERE id = '79708aa1-0397-5c34-b50f-1e5de6d2cab7';
UPDATE "Lesson" SET id = 'B29DoFvQ' WHERE id = 'bbf07b03-66bf-5fca-989d-52d84dccc1c4';
UPDATE "Lesson" SET id = 'Cd8qkxia' WHERE id = '021d3ca6-de6f-5096-8ec0-c94e0299f561';
UPDATE "Lesson" SET id = 'hdiTR2pN' WHERE id = 'db1d2213-cb74-594b-8b1b-b703d112bd9d';
UPDATE "Lesson" SET id = 'bQkPWSRZ' WHERE id = '978c62c9-1650-5bd3-b1f2-e2a23eb9b448';
UPDATE "Lesson" SET id = '83GRLZTe' WHERE id = '3cb3fe8d-c519-531e-8497-1d96b2b42e89';
UPDATE "Lesson" SET id = 'PTGC2FCp' WHERE id = '4d8f0602-3605-50e3-905f-9acac25e39ff';
UPDATE "Lesson" SET id = 'AS5kNo2C' WHERE id = '7c5077de-4ba4-56fa-8e36-473df876a4d1';
UPDATE "Lesson" SET id = 'a4N8CtmR' WHERE id = '1ab4c77a-bce7-5611-a3ee-f6d9e874bb00';
UPDATE "Lesson" SET id = 'JN3NjhKW' WHERE id = 'c34bb389-9f21-5a16-995a-ee69296e8061';
UPDATE "Lesson" SET id = 'EbuEmJiv' WHERE id = '0459e880-2647-5c6d-9c20-b647ad3a7c38';
UPDATE "Lesson" SET id = 'SP1HZmfB' WHERE id = '128bef07-5726-5fbb-8874-618e2043afa0';
UPDATE "Lesson" SET id = 'ml9EVszo' WHERE id = 'a225b9fc-cf2c-51e2-8739-301ac555573e';
UPDATE "Lesson" SET id = 'gOxExhmX' WHERE id = '9c8aad04-3121-5617-92e5-31ff09565dbd';
UPDATE "Lesson" SET id = 'KWLmaekc' WHERE id = '48d00be0-961e-5498-83a3-5fb67bb8afb9';
UPDATE "Lesson" SET id = 'lVADYD2x' WHERE id = 'df91f8fb-56fb-54eb-88e9-da683ca13e63';
UPDATE "Lesson" SET id = '7C5Qq7eA' WHERE id = 'b77e39ca-e43b-5ef8-9653-6a5ee06d632a';
UPDATE "Lesson" SET id = 'WdhFxmDg' WHERE id = 'd0d79dbf-eb26-519c-9304-1538d2ff5edb';
UPDATE "Lesson" SET id = 'OTi3geUv' WHERE id = 'c88f9ef1-9cd8-546d-8a00-7ad39915b5a9';
UPDATE "Lesson" SET id = 'GJ3ctiUV' WHERE id = '4409f1d6-a960-5415-b0b4-dece4e41afc5';
UPDATE "Lesson" SET id = 'bm5gjdyP' WHERE id = 'd5e0f3da-ddd7-5ec9-84fe-0caacc93fba9';
UPDATE "Lesson" SET id = 'qij2ryNX' WHERE id = 'e4dcddf0-e570-5717-9509-44a5b4fd6312';
UPDATE "Lesson" SET id = '2UHASs0a' WHERE id = '361407ba-126a-54d4-9b61-7a3e2ab75056';
UPDATE "Lesson" SET id = 'oFtcvjeD' WHERE id = '6643e7d6-ab9f-5cfb-aede-7181f6caf08e';
UPDATE "Lesson" SET id = 'qpavE3m2' WHERE id = '2aa51a2f-fcb3-54f0-9306-db891f252502';
UPDATE "Lesson" SET id = 'HZabtZ3y' WHERE id = 'ffd35897-e757-5132-bdab-d2e8e1a5e812';
UPDATE "Lesson" SET id = 'oOyA5dPT' WHERE id = '668a32ba-f3d7-5dcd-a6c1-4c5f4aa5df93';
UPDATE "Lesson" SET id = 'AXHaW5wt' WHERE id = '7cd145d4-16f3-5ae7-a46d-b3495f46b588';
UPDATE "Lesson" SET id = 'rpJoAyVC' WHERE id = '2ba5c3a4-f832-537e-b061-e42f1ba7182e';
UPDATE "Lesson" SET id = 'AoE5C7Tn' WHERE id = '3ee2be39-7e79-51a3-902b-ce0a5db76034';
UPDATE "Lesson" SET id = 'NW4cNsSG' WHERE id = 'c716761c-c7a8-5082-98f0-46e2ce855dec';
UPDATE "Lesson" SET id = 'FhcPd7DB' WHERE id = 'fd5f5a8b-5bf5-533f-b13e-131e0d12036c';
UPDATE "Lesson" SET id = 'DEzppWKT' WHERE id = 'bd0433a5-a516-5813-bbd1-963ce7660dc9';
UPDATE "Lesson" SET id = 'TrtjuyWO' WHERE id = '132ba923-aaae-508a-9c8a-adbcd134bea8';
UPDATE "Lesson" SET id = 'cagB1WIJ' WHERE id = 'd6d4207d-3554-5609-9004-7ce292ac3e30';
UPDATE "Lesson" SET id = 'u5WEJIFR' WHERE id = '6c77d0be-0908-5111-bd48-0c0ed4380959';
UPDATE "Lesson" SET id = '6dKNpJOW' WHERE id = '781d860d-e347-5a54-921f-b0a4268b0567';
UPDATE "Lesson" SET id = 'ownPOClC' WHERE id = 'e2ea274d-c87e-5f7e-9510-b53eb562d7ec';
UPDATE "Lesson" SET id = '9RHK2vjY' WHERE id = '7b8dff0a-b22f-5194-8b74-662be64eff2e';
UPDATE "Lesson" SET id = 'iQOR49sN' WHERE id = '22ca0e8d-f23d-5ac7-bea7-4f3762f2a0eb';
UPDATE "Lesson" SET id = 'rIXvy6By' WHERE id = 'e54655ab-ecb6-5dec-bc71-c8d9513eb7e5';
UPDATE "Lesson" SET id = 'UAyACGBQ' WHERE id = 'ce00ec00-02c0-5dca-abca-a38a92ad20ec';
UPDATE "Lesson" SET id = 'shPfdR0O' WHERE id = '2c9d0f1f-5b8d-548a-8c29-c5ea3a53715f';
UPDATE "Lesson" SET id = 'gdoPhgbo' WHERE id = '2099668b-219c-5b66-99fb-498f67cbc05a';
UPDATE "Lesson" SET id = '5RBJS3Ou' WHERE id = 'f34ff947-1275-5a2e-a593-e4de56aaa8db';
UPDATE "Lesson" SET id = 'KUiW7OXI' WHERE id = 'c4529ed0-3b4c-5784-ae80-10f2aaeb4a38';
UPDATE "Lesson" SET id = 'CWzaPEeF' WHERE id = '02d07196-4d42-58bf-8843-c8ac69e22c8b';
UPDATE "Lesson" SET id = 'Z6YQWN43' WHERE id = 'd3b69410-d0c7-58b3-b8fa-a1ba17b24bff';
UPDATE "Lesson" SET id = 'yy31n2C6' WHERE id = '7032b373-65f0-5ab6-941f-a3c612430b07';
UPDATE "Lesson" SET id = '93fBe9Pw' WHERE id = '7b37d9f9-d8f7-5b30-af14-e26e94f256e7';
UPDATE "Lesson" SET id = 'j9BM2qQN' WHERE id = '9f3df94a-f068-5a0d-a876-bc52ca8cbc59';
UPDATE "Lesson" SET id = 'B79tdhtC' WHERE id = '7d3bf72d-1d9d-57fa-93c8-be8e0f4c4c1b';
UPDATE "Lesson" SET id = 'rLA7mPo8' WHERE id = '69c500f5-e04d-563c-87c5-c746e3c0e8c3';
UPDATE "Lesson" SET id = 'ey8Dz5Sd' WHERE id = '5c703c03-3339-521d-8849-8a0fd963309e';
UPDATE "Lesson" SET id = '1mjtWo97' WHERE id = '7364dd6b-d0e2-59b7-8b2b-530ac7e8532d';
UPDATE "Lesson" SET id = '9akgwTQO' WHERE id = 'f758deda-3051-5c4c-a7c5-47ab7cc75568';
UPDATE "Lesson" SET id = 'lnFWOPWK' WHERE id = 'dfa343d0-c80f-56c4-b5cb-f47e010ef024';
UPDATE "Lesson" SET id = '6pkwosvT' WHERE id = 'f4a5a0ac-28a8-5dcd-a7c4-b589b334bc4d';
UPDATE "Lesson" SET id = 'in7g5J8j' WHERE id = '9e65f55e-b509-5a61-8de1-a2a564207305';
UPDATE "Lesson" SET id = 'EYnRpMEy' WHERE id = '4256654f-290c-5270-b751-917c1479c0cb';
UPDATE "Lesson" SET id = 'R4iFK6KB' WHERE id = 'cb76dc81-86b6-58f9-a761-72ba201e87dd';
UPDATE "Lesson" SET id = 'XgmC0PDF' WHERE id = 'd120e002-720f-5b05-a0a8-434f071fc99f';
UPDATE "Lesson" SET id = 'wOMamFTF' WHERE id = 'ac4c4a96-e005-5f05-bc39-bd5196f0fb7e';
UPDATE "Lesson" SET id = 'lzy7StyS' WHERE id = '2533323b-8ea9-5c12-ad4c-4e56a132523c';
UPDATE "Lesson" SET id = 'fqrwPMwC' WHERE id = 'd9a669ea-0f4a-5abc-a21e-89276d3db9f8';
UPDATE "Lesson" SET id = '0BkhB8te' WHERE id = '347d6221-f9f6-595c-971e-5b04e86f997d';
UPDATE "Lesson" SET id = 'Qydy5XKE' WHERE id = '10321dae-f393-5480-a367-03c92090e06e';
UPDATE "Lesson" SET id = '9TCmIbgH' WHERE id = '7b1340a2-4659-5ac1-8edd-8664b35066f3';
UPDATE "Lesson" SET id = 'HcJBOeNE' WHERE id = '835a09f9-0e9a-57fc-8439-13f574529e98';
UPDATE "Lesson" SET id = 'Ni5B35KF' WHERE id = 'c722b501-f177-54fd-8766-d2cbc878b9ef';
UPDATE "Lesson" SET id = 'D3YGqGDM' WHERE id = '41f11844-2ac0-510c-906a-851d9e0bedf1';
UPDATE "Lesson" SET id = 'EaVInCA2' WHERE id = '42589146-e17e-5a36-943e-ae442ace7442';
UPDATE "Lesson" SET id = 'GKQERNzh' WHERE id = '820a4ebe-114b-5f5f-8f1a-0051077c883c';
UPDATE "Lesson" SET id = 'EBcdHf72' WHERE id = '807d981d-45d9-59b2-a880-904b52b9b660';
UPDATE "Lesson" SET id = 'FqeIpofE' WHERE id = '05681e46-e328-5bfc-bde7-11d1a586d673';
UPDATE "Lesson" SET id = 'f8WgRh1v' WHERE id = '9b3cd05e-8d21-51ab-86e6-a29de68498d0';
UPDATE "Lesson" SET id = 'U2UaUeHG' WHERE id = '90f0521a-905c-53fe-a5d2-e3909816ed00';
UPDATE "Lesson" SET id = 'HA8OTG90' WHERE id = '457cf68a-5144-57ee-ba20-22420544590a';
UPDATE "Lesson" SET id = 'k3Hrnfeg' WHERE id = '62f107e5-279b-5cda-907f-b973eb219b99';
UPDATE "Lesson" SET id = '7OuBmC3B' WHERE id = 'b78a2e7d-e040-53bb-8532-ce697bb37a26';
UPDATE "Lesson" SET id = 'DYuX6Log' WHERE id = '03942ed1-f449-589c-b382-d868ec79a92b';
UPDATE "Lesson" SET id = '31whc3cy' WHERE id = '75ef6e5f-d675-56ae-864f-e5c44089f3a0';
UPDATE "Lesson" SET id = 'q9Zts59e' WHERE id = '683d95a9-6ab5-591e-b820-d75270a45693';
UPDATE "Lesson" SET id = 'ka4XA5Bd' WHERE id = '6258f255-f839-5dd7-aed6-578dffc0317c';
UPDATE "Lesson" SET id = 'Cbtzm5vq' WHERE id = 'bc1b2d33-6439-5fe4-a2b6-ac7856286577';
UPDATE "Lesson" SET id = 'wNhh9YIo' WHERE id = '6e4b9d5f-3dd2-5866-9b63-d155915e7442';
UPDATE "Lesson" SET id = 'XqxCWcHD' WHERE id = 'd1e43102-9298-53fb-b2c9-c9ec1e7bfdaa';
UPDATE "Lesson" SET id = 'e2HnnHTp' WHERE id = '5cb20727-6507-5da5-aadd-f16044544151';
UPDATE "Lesson" SET id = 'sqeB0pDc' WHERE id = 'a8a61ebb-3467-5b1c-87c8-47b62b501c1f';
UPDATE "Lesson" SET id = 'ZOpzUhO7' WHERE id = 'd30ea571-909d-58f5-9e8a-3bb452f92e0c';
UPDATE "Lesson" SET id = 'wkOjTfuH' WHERE id = 'eaa00e9f-8f9b-5e45-b22d-39c44486aeb5';
UPDATE "Lesson" SET id = 'OhMPIyCD' WHERE id = '8adbc6c9-c232-5041-a299-ebcb3bd8699c';
UPDATE "Lesson" SET id = 'PBsjIzAN' WHERE id = '8bbb2c9f-4671-5e4b-9a22-5db6d1d2efe2';
UPDATE "Lesson" SET id = 'UNqeuWes' WHERE id = '524b2a9a-e8d0-5c6a-bb2b-606d1812d8ed';
UPDATE "Lesson" SET id = 'IBl7UjOh' WHERE id = '847d63f5-529f-5a5f-a851-1cdbc08f11b3';
UPDATE "Lesson" SET id = 'eri0clQ4' WHERE id = '9a2b2234-1c63-5e38-8e22-00bf063c38a4';
UPDATE "Lesson" SET id = 'P916s2Lb' WHERE id = '8bf735f4-6ab2-57d5-a21b-71c56f532b90';
UPDATE "Lesson" SET id = '8EIZiImq' WHERE id = '7a428419-22c2-502a-98e3-fd78ea58b13f';
UPDATE "Lesson" SET id = 'E2OPveph' WHERE id = '42f08a8b-e99a-5321-9c78-bb3f7edc7c22';
UPDATE "Lesson" SET id = 'mkSy1y1e' WHERE id = '26a012ae-ef70-531e-a511-41304960c1ec';
UPDATE "Lesson" SET id = '4joBxCzc' WHERE id = 'f29fe201-adbc-5f98-bcf1-798104ac157b';
UPDATE "Lesson" SET id = 'B9dWPgPu' WHERE id = '01b999d0-0f20-5b6c-accf-ef8ac8c1eee8';
UPDATE "Lesson" SET id = 'd9ZcqElQ' WHERE id = '5bf757d6-68fc-538c-8b01-05c7d102635f';
UPDATE "Lesson" SET id = 'YayrH0SU' WHERE id = '94d4702b-4572-5c52-808b-d6c70f8eb870';
UPDATE "Lesson" SET id = 'XU9Mj0cb' WHERE id = '93ceb988-6172-5897-a0a9-5e3202929afa';
UPDATE "Lesson" SET id = 'S1pB7k5c' WHERE id = '5073a501-3bde-555a-90f2-acf3db1deb8f';
UPDATE "Lesson" SET id = 'EXYnBncp' WHERE id = 'fc9318e1-bb27-5629-ba07-ce42521e00b1';
UPDATE "Lesson" SET id = 'K3FtV6DE' WHERE id = 'c4b3fd2d-cff4-5d42-ab8c-2cc1d1473fb9';
UPDATE "Lesson" SET id = 'u0GwZNjq' WHERE id = '6c72826e-950d-5fa6-b236-f2a7a120023e';
UPDATE "Lesson" SET id = '2UBbXeys' WHERE id = '36907d1b-559a-5e2c-be51-6f68c59b265b';
UPDATE "Lesson" SET id = 'IV12C8pd' WHERE id = '089173f0-40b8-575b-a8cc-bf92cafd0e9a';
UPDATE "Lesson" SET id = 'GLbETK8u' WHERE id = '824959be-5148-5c2e-8317-96396a2cc381';
UPDATE "Lesson" SET id = 'NfdYN0FB' WHERE id = 'c71fd756-8972-5501-b8ac-53ea67e9766b';
UPDATE "Lesson" SET id = 'lRAvJ9ya' WHERE id = '2511baab-85b9-5058-b006-376d76d28adc';
UPDATE "Lesson" SET id = 'kSiIhGjj' WHERE id = '628e6084-5fc0-5ddd-a7ec-d38237016b59';
UPDATE "Lesson" SET id = '72mYNXMN' WHERE id = 'f574a256-4b55-5ac7-a224-c4188e01a791';
UPDATE "Lesson" SET id = 'ydDp7910' WHERE id = '325bbde3-3b7b-51b0-87c3-2d120dee83fe';
UPDATE "Lesson" SET id = 'XMAPltKN' WHERE id = '93887c8b-632d-5889-83f5-8a8875829b92';
UPDATE "Lesson" SET id = 'auiVwPfv' WHERE id = '962edccf-acc9-59ab-9bc1-68d745e4e9eb';
UPDATE "Lesson" SET id = 'B6L655Tq' WHERE id = 'bb3a0bb6-7777-51e4-b1a3-e5e4d90e78c5';
UPDATE "Lesson" SET id = '08I3wmvd' WHERE id = 'eef608f1-6e26-595b-bb96-67483190a4a5';
UPDATE "Lesson" SET id = 'uLv2d73v' WHERE id = 'aa87e9f0-1d79-55ab-82bf-480342cc27d0';
UPDATE "Lesson" SET id = 'C3L5ffFm' WHERE id = '40b387b5-d95d-5fe0-bc61-f60006ba52bc';
UPDATE "Lesson" SET id = 'XbqBA0WN' WHERE id = '17972a3f-7c34-50c7-ab82-37ce2f4f3c72';
UPDATE "Lesson" SET id = 'V1mSyXXW' WHERE id = 'cfb1e08e-ecd1-5792-9b16-0de1296eb8b9';
UPDATE "Lesson" SET id = 'ujkjnftW' WHERE id = 'aa9fa023-a3d9-5bd0-8d62-1bcfcb2c8a47';
UPDATE "Lesson" SET id = 'L6j6UTpK' WHERE id = '0b3add3a-908f-550a-979a-2c97f9f2a3fd';
UPDATE "Lesson" SET id = 'ZTtz8r9z' WHERE id = '19cd2ded-f62b-5daf-8bca-986adf55fa47';
UPDATE "Lesson" SET id = 'YXD6R38j' WHERE id = '18174178-8df1-589f-898d-18e4efa9d977';
UPDATE "Lesson" SET id = 'Q09tb66f' WHERE id = '4eeeb9a9-1b78-569b-ac67-aa2259623a59';
UPDATE "Lesson" SET id = 'ruoxM9NC' WHERE id = '2b2ee26f-c63d-5702-a6bd-3b1c4040aa3f';
UPDATE "Lesson" SET id = '0ttXEvWS' WHERE id = '722de755-be6d-5650-b41c-ced5159fb818';
UPDATE "Lesson" SET id = 'pZqXVZT6' WHERE id = '6795e417-cf57-5d3a-ad46-ed9bfff2c70d';
UPDATE "Lesson" SET id = 'QMZOS6lm' WHERE id = '1088d3c8-1278-51a2-be40-9f6388266ffd';
UPDATE "Lesson" SET id = '11adcIAX' WHERE id = 'b1b1965b-98c2-5e55-bcbb-b711049084a0';
UPDATE "Lesson" SET id = 'IOuAZlrA' WHERE id = 'c20eaaba-9525-5700-af91-e75feca2ed5e';
UPDATE "Lesson" SET id = 'RgR4UlTf' WHERE id = 'cb9c4ff2-ce25-5dd9-8759-39833bff81e5';
UPDATE "Lesson" SET id = '2kLT4eGh' WHERE id = '3624c58f-385c-529d-80b7-237ebe310549';
UPDATE "Lesson" SET id = 'wHu1ZhGn' WHERE id = 'eac12eb1-57db-5227-81ce-5d69c9af6992';
UPDATE "Lesson" SET id = 't4uKXx1v' WHERE id = 'e7b4aac4-d131-536d-aead-09beffe55052';
UPDATE "Lesson" SET id = 'dXt55Z1c' WHERE id = '1d17e7f3-f3d3-515a-8d5f-bcec81be5ad3';
UPDATE "Lesson" SET id = 'GBlkF5Ux' WHERE id = 'fef9a124-bf39-506f-84f7-c358dcae24b9';
UPDATE "Lesson" SET id = 'sicIdea1' WHERE id = 'd0000000-0000-4000-8000-000000000001';
UPDATE "Lesson" SET id = 'sicIdea2' WHERE id = 'd0000000-0000-4000-8000-000000000002';
UPDATE "Lesson" SET id = 'sicIdea3' WHERE id = 'd0000000-0000-4000-8000-000000000003';
UPDATE "Lesson" SET id = 'sicNajd1' WHERE id = 'd0000000-0000-4000-8000-000000000004';
UPDATE "Lesson" SET id = 'sicNajd2' WHERE id = 'd0000000-0000-4000-8000-000000000005';
UPDATE "Lesson" SET id = 'torreLuc' WHERE id = 'd0000000-0000-4000-8000-000000000006';
UPDATE "Lesson" SET id = 'torrePhi' WHERE id = 'd0000000-0000-4000-8000-000000000007';

-- And the lessons that do not come from the seed, with a random id.
DO $$
DECLARE
  alphabet CONSTANT text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  row_id text;
  candidate text;
BEGIN
  FOR row_id IN SELECT id FROM "Lesson" WHERE length(id) > 8 LOOP
    LOOP
      candidate := '';
      FOR position IN 1..8 LOOP
        candidate := candidate || substr(alphabet, floor(random() * 62)::int + 1, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Lesson" WHERE id = candidate);
    END LOOP;
    UPDATE "Lesson" SET id = candidate WHERE id = row_id;
  END LOOP;
END $$;
