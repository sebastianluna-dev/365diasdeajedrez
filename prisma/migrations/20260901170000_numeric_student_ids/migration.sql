-- Numeric identifiers in the student's URL, and removal of the chapter slug.
--
-- The chapter comes to be addressed by its ORDER NUMBER within the course
-- (`/cursos/10000003/1`), so its slug is left unused and is dropped.
--
-- The imported course's lesson ids are derived from the `stableKey`, as before:
-- the old→new mapping was computed with the same hash the seeding module uses,
-- so the seed goes on finding its rows and does not duplicate them.
--
-- Renaming Course.id and Lesson.id is safe: everything pointing at them is
-- ON UPDATE CASCADE.

DROP INDEX IF EXISTS "Chapter_courseId_slug_key";
ALTER TABLE "Chapter" DROP COLUMN IF EXISTS "slug";

UPDATE "Course" SET id = '10000001' WHERE id = 'c0000000-0000-4000-8000-000000000001';
UPDATE "Course" SET id = '10000002' WHERE id = 'c0000000-0000-4000-8000-000000000002';
UPDATE "Course" SET id = '10000003' WHERE id = 'c0000000-0000-4000-8000-000000000003';

UPDATE "Lesson" SET id = '88206697' WHERE id = 'iCqKMoNH';
UPDATE "Lesson" SET id = '38478568' WHERE id = 'r201kNOa';
UPDATE "Lesson" SET id = '82240641' WHERE id = 'k6E8YsI5';
UPDATE "Lesson" SET id = '33816018' WHERE id = 'X14ju2jc';
UPDATE "Lesson" SET id = '68539960' WHERE id = 'aYFRdRQc';
UPDATE "Lesson" SET id = '76309900' WHERE id = 'lyDa7PYs';
UPDATE "Lesson" SET id = '44135467' WHERE id = 'MKPXpOs5';
UPDATE "Lesson" SET id = '66830097' WHERE id = 'GCcrUcrh';
UPDATE "Lesson" SET id = '96055720' WHERE id = 'To2HfheO';
UPDATE "Lesson" SET id = '64941552' WHERE id = 'Y2dW91VQ';
UPDATE "Lesson" SET id = '58444430' WHERE id = '9aAISUb6';
UPDATE "Lesson" SET id = '06628223' WHERE id = 'iCoaIeA7';
UPDATE "Lesson" SET id = '04531484' WHERE id = 'sWfBTIkY';
UPDATE "Lesson" SET id = '94395972' WHERE id = 'JED5tt5a';
UPDATE "Lesson" SET id = '35028047' WHERE id = 'L9K806yZ';
UPDATE "Lesson" SET id = '73938874' WHERE id = 'RVrDWmPW';
UPDATE "Lesson" SET id = '27359245' WHERE id = 'A9TJtwOF';
UPDATE "Lesson" SET id = '02464434' WHERE id = 'eKmCeyfK';
UPDATE "Lesson" SET id = '83604659' WHERE id = '4rQEGEJN';
UPDATE "Lesson" SET id = '08145521' WHERE id = 'GgDSNpGJ';
UPDATE "Lesson" SET id = '12813122' WHERE id = '7yOlDbE0';
UPDATE "Lesson" SET id = '70332172' WHERE id = 'B29DoFvQ';
UPDATE "Lesson" SET id = '29062160' WHERE id = 'Cd8qkxia';
UPDATE "Lesson" SET id = '99493615' WHERE id = 'hdiTR2pN';
UPDATE "Lesson" SET id = '10812031' WHERE id = 'bQkPWSRZ';
UPDATE "Lesson" SET id = '09417590' WHERE id = '83GRLZTe';
UPDATE "Lesson" SET id = '73624547' WHERE id = 'PTGC2FCp';
UPDATE "Lesson" SET id = '40925440' WHERE id = 'AS5kNo2C';
UPDATE "Lesson" SET id = '60928187' WHERE id = 'a4N8CtmR';
UPDATE "Lesson" SET id = '55979302' WHERE id = 'JN3NjhKW';
UPDATE "Lesson" SET id = '49288109' WHERE id = 'EbuEmJiv';
UPDATE "Lesson" SET id = '89977817' WHERE id = 'SP1HZmfB';
UPDATE "Lesson" SET id = '27527436' WHERE id = 'ml9EVszo';
UPDATE "Lesson" SET id = '68349383' WHERE id = 'gOxExhmX';
UPDATE "Lesson" SET id = '28140062' WHERE id = 'KWLmaekc';
UPDATE "Lesson" SET id = '35816165' WHERE id = 'lVADYD2x';
UPDATE "Lesson" SET id = '36728908' WHERE id = '7C5Qq7eA';
UPDATE "Lesson" SET id = '85715856' WHERE id = 'WdhFxmDg';
UPDATE "Lesson" SET id = '03816609' WHERE id = 'OTi3geUv';
UPDATE "Lesson" SET id = '89149601' WHERE id = 'GJ3ctiUV';
UPDATE "Lesson" SET id = '34381541' WHERE id = 'bm5gjdyP';
UPDATE "Lesson" SET id = '80109293' WHERE id = 'qij2ryNX';
UPDATE "Lesson" SET id = '40768622' WHERE id = '2UHASs0a';
UPDATE "Lesson" SET id = '27141921' WHERE id = 'oFtcvjeD';
UPDATE "Lesson" SET id = '25672900' WHERE id = 'qpavE3m2';
UPDATE "Lesson" SET id = '51811710' WHERE id = 'HZabtZ3y';
UPDATE "Lesson" SET id = '28063575' WHERE id = 'oOyA5dPT';
UPDATE "Lesson" SET id = '49922341' WHERE id = 'AXHaW5wt';
UPDATE "Lesson" SET id = '35548036' WHERE id = 'rpJoAyVC';
UPDATE "Lesson" SET id = '26076113' WHERE id = 'AoE5C7Tn';
UPDATE "Lesson" SET id = '92889800' WHERE id = 'NW4cNsSG';
UPDATE "Lesson" SET id = '35091533' WHERE id = 'FhcPd7DB';
UPDATE "Lesson" SET id = '94155229' WHERE id = 'DEzppWKT';
UPDATE "Lesson" SET id = '93950488' WHERE id = 'TrtjuyWO';
UPDATE "Lesson" SET id = '42253409' WHERE id = 'cagB1WIJ';
UPDATE "Lesson" SET id = '89809897' WHERE id = 'u5WEJIFR';
UPDATE "Lesson" SET id = '09437184' WHERE id = '6dKNpJOW';
UPDATE "Lesson" SET id = '64970636' WHERE id = 'ownPOClC';
UPDATE "Lesson" SET id = '31508778' WHERE id = '9RHK2vjY';
UPDATE "Lesson" SET id = '42412169' WHERE id = 'iQOR49sN';
UPDATE "Lesson" SET id = '90516256' WHERE id = 'rIXvy6By';
UPDATE "Lesson" SET id = '60602252' WHERE id = 'UAyACGBQ';
UPDATE "Lesson" SET id = '47511128' WHERE id = 'shPfdR0O';
UPDATE "Lesson" SET id = '23293672' WHERE id = 'gdoPhgbo';
UPDATE "Lesson" SET id = '39918786' WHERE id = '5RBJS3Ou';
UPDATE "Lesson" SET id = '62889632' WHERE id = 'KUiW7OXI';
UPDATE "Lesson" SET id = '28307661' WHERE id = 'CWzaPEeF';
UPDATE "Lesson" SET id = '12868969' WHERE id = 'Z6YQWN43';
UPDATE "Lesson" SET id = '20951002' WHERE id = 'yy31n2C6';
UPDATE "Lesson" SET id = '35796798' WHERE id = '93fBe9Pw';
UPDATE "Lesson" SET id = '91940423' WHERE id = 'j9BM2qQN';
UPDATE "Lesson" SET id = '59759710' WHERE id = 'B79tdhtC';
UPDATE "Lesson" SET id = '57054720' WHERE id = 'rLA7mPo8';
UPDATE "Lesson" SET id = '22031789' WHERE id = 'ey8Dz5Sd';
UPDATE "Lesson" SET id = '50178653' WHERE id = '1mjtWo97';
UPDATE "Lesson" SET id = '78288106' WHERE id = '9akgwTQO';
UPDATE "Lesson" SET id = '33780526' WHERE id = 'lnFWOPWK';
UPDATE "Lesson" SET id = '45020895' WHERE id = '6pkwosvT';
UPDATE "Lesson" SET id = '81541927' WHERE id = 'in7g5J8j';
UPDATE "Lesson" SET id = '66191262' WHERE id = 'EYnRpMEy';
UPDATE "Lesson" SET id = '38094229' WHERE id = 'R4iFK6KB';
UPDATE "Lesson" SET id = '92424515' WHERE id = 'XgmC0PDF';
UPDATE "Lesson" SET id = '26404535' WHERE id = 'wOMamFTF';
UPDATE "Lesson" SET id = '71092968' WHERE id = 'lzy7StyS';
UPDATE "Lesson" SET id = '76545448' WHERE id = 'fqrwPMwC';
UPDATE "Lesson" SET id = '25839692' WHERE id = '0BkhB8te';
UPDATE "Lesson" SET id = '60943768' WHERE id = 'Qydy5XKE';
UPDATE "Lesson" SET id = '39420983' WHERE id = '9TCmIbgH';
UPDATE "Lesson" SET id = '10994492' WHERE id = 'HcJBOeNE';
UPDATE "Lesson" SET id = '94111963' WHERE id = 'Ni5B35KF';
UPDATE "Lesson" SET id = '51482252' WHERE id = 'D3YGqGDM';
UPDATE "Lesson" SET id = '68505664' WHERE id = 'EaVInCA2';
UPDATE "Lesson" SET id = '00807555' WHERE id = 'GKQERNzh';
UPDATE "Lesson" SET id = '85299718' WHERE id = 'EBcdHf72';
UPDATE "Lesson" SET id = '54007052' WHERE id = 'FqeIpofE';
UPDATE "Lesson" SET id = '50841371' WHERE id = 'f8WgRh1v';
UPDATE "Lesson" SET id = '40264214' WHERE id = 'U2UaUeHG';
UPDATE "Lesson" SET id = '94681878' WHERE id = 'HA8OTG90';
UPDATE "Lesson" SET id = '81799528' WHERE id = 'k3Hrnfeg';
UPDATE "Lesson" SET id = '38654497' WHERE id = '7OuBmC3B';
UPDATE "Lesson" SET id = '38694306' WHERE id = 'DYuX6Log';
UPDATE "Lesson" SET id = '79054744' WHERE id = '31whc3cy';
UPDATE "Lesson" SET id = '41996150' WHERE id = 'q9Zts59e';
UPDATE "Lesson" SET id = '88258755' WHERE id = 'ka4XA5Bd';
UPDATE "Lesson" SET id = '87510778' WHERE id = 'Cbtzm5vq';
UPDATE "Lesson" SET id = '05751082' WHERE id = 'wNhh9YIo';
UPDATE "Lesson" SET id = '98926211' WHERE id = 'XqxCWcHD';
UPDATE "Lesson" SET id = '28791755' WHERE id = 'e2HnnHTp';
UPDATE "Lesson" SET id = '86072318' WHERE id = 'sqeB0pDc';
UPDATE "Lesson" SET id = '14534705' WHERE id = 'ZOpzUhO7';
UPDATE "Lesson" SET id = '40493569' WHERE id = 'wkOjTfuH';
UPDATE "Lesson" SET id = '89814045' WHERE id = 'OhMPIyCD';
UPDATE "Lesson" SET id = '97490325' WHERE id = 'PBsjIzAN';
UPDATE "Lesson" SET id = '25242826' WHERE id = 'UNqeuWes';
UPDATE "Lesson" SET id = '25952985' WHERE id = 'IBl7UjOh';
UPDATE "Lesson" SET id = '43428986' WHERE id = 'eri0clQ4';
UPDATE "Lesson" SET id = '97346853' WHERE id = 'P916s2Lb';
UPDATE "Lesson" SET id = '26254442' WHERE id = '8EIZiImq';
UPDATE "Lesson" SET id = '60893473' WHERE id = 'E2OPveph';
UPDATE "Lesson" SET id = '80849250' WHERE id = 'mkSy1y1e';
UPDATE "Lesson" SET id = '29613852' WHERE id = '4joBxCzc';
UPDATE "Lesson" SET id = '15385298' WHERE id = 'B9dWPgPu';
UPDATE "Lesson" SET id = '17744290' WHERE id = 'd9ZcqElQ';
UPDATE "Lesson" SET id = '82239442' WHERE id = 'YayrH0SU';
UPDATE "Lesson" SET id = '76567421' WHERE id = 'XU9Mj0cb';
UPDATE "Lesson" SET id = '05519210' WHERE id = 'S1pB7k5c';
UPDATE "Lesson" SET id = '27457941' WHERE id = 'EXYnBncp';
UPDATE "Lesson" SET id = '69357496' WHERE id = 'K3FtV6DE';
UPDATE "Lesson" SET id = '84009396' WHERE id = 'u0GwZNjq';
UPDATE "Lesson" SET id = '44575444' WHERE id = '2UBbXeys';
UPDATE "Lesson" SET id = '85504431' WHERE id = 'IV12C8pd';
UPDATE "Lesson" SET id = '03901206' WHERE id = 'GLbETK8u';
UPDATE "Lesson" SET id = '91567451' WHERE id = 'NfdYN0FB';
UPDATE "Lesson" SET id = '77613528' WHERE id = 'lRAvJ9ya';
UPDATE "Lesson" SET id = '82625211' WHERE id = 'kSiIhGjj';
UPDATE "Lesson" SET id = '56265549' WHERE id = '72mYNXMN';
UPDATE "Lesson" SET id = '01979376' WHERE id = 'ydDp7910';
UPDATE "Lesson" SET id = '76499527' WHERE id = 'XMAPltKN';
UPDATE "Lesson" SET id = '06072171' WHERE id = 'auiVwPfv';
UPDATE "Lesson" SET id = '78129918' WHERE id = 'B6L655Tq';
UPDATE "Lesson" SET id = '86810831' WHERE id = '08I3wmvd';
UPDATE "Lesson" SET id = '05309171' WHERE id = 'uLv2d73v';
UPDATE "Lesson" SET id = '49517314' WHERE id = 'C3L5ffFm';
UPDATE "Lesson" SET id = '31234289' WHERE id = 'XbqBA0WN';
UPDATE "Lesson" SET id = '77426936' WHERE id = 'V1mSyXXW';
UPDATE "Lesson" SET id = '09053778' WHERE id = 'ujkjnftW';
UPDATE "Lesson" SET id = '18184350' WHERE id = 'L6j6UTpK';
UPDATE "Lesson" SET id = '55576315' WHERE id = 'ZTtz8r9z';
UPDATE "Lesson" SET id = '43501149' WHERE id = 'YXD6R38j';
UPDATE "Lesson" SET id = '88597025' WHERE id = 'Q09tb66f';
UPDATE "Lesson" SET id = '36618192' WHERE id = 'ruoxM9NC';
UPDATE "Lesson" SET id = '45150920' WHERE id = '0ttXEvWS';
UPDATE "Lesson" SET id = '39837758' WHERE id = 'pZqXVZT6';
UPDATE "Lesson" SET id = '66108012' WHERE id = 'QMZOS6lm';
UPDATE "Lesson" SET id = '77012425' WHERE id = '11adcIAX';
UPDATE "Lesson" SET id = '44069770' WHERE id = 'IOuAZlrA';
UPDATE "Lesson" SET id = '36926757' WHERE id = 'RgR4UlTf';
UPDATE "Lesson" SET id = '46736207' WHERE id = '2kLT4eGh';
UPDATE "Lesson" SET id = '43677909' WHERE id = 'wHu1ZhGn';
UPDATE "Lesson" SET id = '10069959' WHERE id = 't4uKXx1v';
UPDATE "Lesson" SET id = '93133170' WHERE id = 'dXt55Z1c';
UPDATE "Lesson" SET id = '49161741' WHERE id = 'GBlkF5Ux';
UPDATE "Lesson" SET id = '20000001' WHERE id = 'sicIdea1';
UPDATE "Lesson" SET id = '20000002' WHERE id = 'sicIdea2';
UPDATE "Lesson" SET id = '20000003' WHERE id = 'sicIdea3';
UPDATE "Lesson" SET id = '20000004' WHERE id = 'sicNajd1';
UPDATE "Lesson" SET id = '20000005' WHERE id = 'sicNajd2';
UPDATE "Lesson" SET id = '20000006' WHERE id = 'torreLuc';
UPDATE "Lesson" SET id = '20000007' WHERE id = 'torrePhi';

-- And what does not come from the seed, with a random 8-digit number.
DO $$
DECLARE
  row_id text;
  candidate text;
BEGIN
  FOR row_id IN SELECT id FROM "Course" WHERE id !~ '^[0-9]{8}$' LOOP
    LOOP
      candidate := lpad(floor(random() * 100000000)::bigint::text, 8, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Course" WHERE id = candidate);
    END LOOP;
    UPDATE "Course" SET id = candidate WHERE id = row_id;
  END LOOP;
END $$;
DO $$
DECLARE
  row_id text;
  candidate text;
BEGIN
  FOR row_id IN SELECT id FROM "Lesson" WHERE id !~ '^[0-9]{8}$' LOOP
    LOOP
      candidate := lpad(floor(random() * 100000000)::bigint::text, 8, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Lesson" WHERE id = candidate);
    END LOOP;
    UPDATE "Lesson" SET id = candidate WHERE id = row_id;
  END LOOP;
END $$;
