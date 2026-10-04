PRAGMA foreign_keys=ON;

-- Da X Filez initial public image archive.
--
-- Source folders verified in The CROWD Drive:
-- - Hype3Wear / X Tha God: 5 still images
-- - Grizz Exams / X Tha God: 87 still images
-- Total: 92 public launch images.
--
-- Raw MOV files in the Grizz Exams folder are intentionally NOT imported here.
-- They remain pending classification as interview / BTS / other before Player ingest.
--
-- Access direction:
-- - PUBLIC at initial launch;
-- - X Tha God may subsequently curate any individual file into
--   HOUSE / UNLOCK / CROWN / VAULT without changing collection membership.
--
-- Drive view URLs are retained as provenance/source links.
-- Web-safe Drive thumbnail endpoints are used for image rendering.

WITH seed(
  provider,external_id,canonical_url,title,sort_order,
  description,source_name,source_url,thumbnail_url,rights_status
) AS (
VALUES
(
  'google-drive','1fwpg3dAGuDe1hJRybr11RLwjfoqsA8Xg','https://drive.google.com/file/d/1fwpg3dAGuDe1hJRybr11RLwjfoqsA8Xg/view?usp=drivesdk',
  'X Tha God — Hype3Wear Archive 001',1000,
  'Da X Filez initial public still-image import. Original file: 5801F497-10FE-4F3E-BF54-72A062075E37.PNG','The CROWD Drive — Hype3Wear / X Tha God','https://drive.google.com/file/d/1fwpg3dAGuDe1hJRybr11RLwjfoqsA8Xg/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1fwpg3dAGuDe1hJRybr11RLwjfoqsA8Xg&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1M2qx-woEi7MCpZoyk5H96LhY6JBd_OtM','https://drive.google.com/file/d/1M2qx-woEi7MCpZoyk5H96LhY6JBd_OtM/view?usp=drivesdk',
  'X Tha God — Hype3Wear Archive 002',1001,
  'Da X Filez initial public still-image import. Original file: CF2457C5-BAA5-4995-AD96-913CE7987099.PNG','The CROWD Drive — Hype3Wear / X Tha God','https://drive.google.com/file/d/1M2qx-woEi7MCpZoyk5H96LhY6JBd_OtM/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1M2qx-woEi7MCpZoyk5H96LhY6JBd_OtM&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1VGS-pHaLlNHRrMcsL0FK8L6111MUntPp','https://drive.google.com/file/d/1VGS-pHaLlNHRrMcsL0FK8L6111MUntPp/view?usp=drivesdk',
  'X Tha God — Hype3Wear Archive 003',1002,
  'Da X Filez initial public still-image import. Original file: IMG_1466.PNG','The CROWD Drive — Hype3Wear / X Tha God','https://drive.google.com/file/d/1VGS-pHaLlNHRrMcsL0FK8L6111MUntPp/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1VGS-pHaLlNHRrMcsL0FK8L6111MUntPp&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1NadZ6ggXebQiWoiAOccD06frX4N183Rj','https://drive.google.com/file/d/1NadZ6ggXebQiWoiAOccD06frX4N183Rj/view?usp=drivesdk',
  'X Tha God — Hype3Wear Archive 004',1003,
  'Da X Filez initial public still-image import. Original file: IMG_1470.PNG','The CROWD Drive — Hype3Wear / X Tha God','https://drive.google.com/file/d/1NadZ6ggXebQiWoiAOccD06frX4N183Rj/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1NadZ6ggXebQiWoiAOccD06frX4N183Rj&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1izlRNFMXGrBXIsl_MeKYoSZsxyJPvWwy','https://drive.google.com/file/d/1izlRNFMXGrBXIsl_MeKYoSZsxyJPvWwy/view?usp=drivesdk',
  'X Tha God — Hype3Wear Archive 005',1004,
  'Da X Filez initial public still-image import. Original file: IMG_8812.PNG','The CROWD Drive — Hype3Wear / X Tha God','https://drive.google.com/file/d/1izlRNFMXGrBXIsl_MeKYoSZsxyJPvWwy/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1izlRNFMXGrBXIsl_MeKYoSZsxyJPvWwy&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1JU6SqazfL3RQXWVyeMCaPvVqazwSHvuu','https://drive.google.com/file/d/1JU6SqazfL3RQXWVyeMCaPvVqazwSHvuu/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 001',1100,
  'Da X Filez initial public still-image import. Original file: IMG_5796.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1JU6SqazfL3RQXWVyeMCaPvVqazwSHvuu/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1JU6SqazfL3RQXWVyeMCaPvVqazwSHvuu&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','16NnS-uTFDU98nVnAdIatL9vB2UE-jUqh','https://drive.google.com/file/d/16NnS-uTFDU98nVnAdIatL9vB2UE-jUqh/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 002',1101,
  'Da X Filez initial public still-image import. Original file: IMG_5797.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/16NnS-uTFDU98nVnAdIatL9vB2UE-jUqh/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=16NnS-uTFDU98nVnAdIatL9vB2UE-jUqh&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Ildoa7oj0ovjlTCdUkPUwi7fMjl75nqB','https://drive.google.com/file/d/1Ildoa7oj0ovjlTCdUkPUwi7fMjl75nqB/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 003',1102,
  'Da X Filez initial public still-image import. Original file: IMG_5798.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Ildoa7oj0ovjlTCdUkPUwi7fMjl75nqB/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Ildoa7oj0ovjlTCdUkPUwi7fMjl75nqB&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1OS2-tKlCtrP3hdCPgWloTYOpl-l9hgkL','https://drive.google.com/file/d/1OS2-tKlCtrP3hdCPgWloTYOpl-l9hgkL/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 004',1103,
  'Da X Filez initial public still-image import. Original file: IMG_5799.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1OS2-tKlCtrP3hdCPgWloTYOpl-l9hgkL/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1OS2-tKlCtrP3hdCPgWloTYOpl-l9hgkL&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1us_65FMMvm-ahuFF9ojgZ2SisvV61e9k','https://drive.google.com/file/d/1us_65FMMvm-ahuFF9ojgZ2SisvV61e9k/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 005',1104,
  'Da X Filez initial public still-image import. Original file: IMG_5801.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1us_65FMMvm-ahuFF9ojgZ2SisvV61e9k/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1us_65FMMvm-ahuFF9ojgZ2SisvV61e9k&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Gf58DNr9U9w1pFk0AeuE4e0Samot3VOn','https://drive.google.com/file/d/1Gf58DNr9U9w1pFk0AeuE4e0Samot3VOn/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 006',1105,
  'Da X Filez initial public still-image import. Original file: IMG_5802.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Gf58DNr9U9w1pFk0AeuE4e0Samot3VOn/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Gf58DNr9U9w1pFk0AeuE4e0Samot3VOn&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1NIpsdx-o7ASXM-5DPZ7BW2_woT0tzJ64','https://drive.google.com/file/d/1NIpsdx-o7ASXM-5DPZ7BW2_woT0tzJ64/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 007',1106,
  'Da X Filez initial public still-image import. Original file: IMG_5803.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1NIpsdx-o7ASXM-5DPZ7BW2_woT0tzJ64/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1NIpsdx-o7ASXM-5DPZ7BW2_woT0tzJ64&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1s4SumUbSI3BoDcVG0meS00pwleOhoGCo','https://drive.google.com/file/d/1s4SumUbSI3BoDcVG0meS00pwleOhoGCo/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 008',1107,
  'Da X Filez initial public still-image import. Original file: IMG_5806.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1s4SumUbSI3BoDcVG0meS00pwleOhoGCo/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1s4SumUbSI3BoDcVG0meS00pwleOhoGCo&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1LhaTDELPVGaOgIdmoYQqB-p8UhRIpLhy','https://drive.google.com/file/d/1LhaTDELPVGaOgIdmoYQqB-p8UhRIpLhy/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 009',1108,
  'Da X Filez initial public still-image import. Original file: IMG_5808.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1LhaTDELPVGaOgIdmoYQqB-p8UhRIpLhy/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1LhaTDELPVGaOgIdmoYQqB-p8UhRIpLhy&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1cjGaCCprjz3pY8MRP14g8--cSq0c1hOZ','https://drive.google.com/file/d/1cjGaCCprjz3pY8MRP14g8--cSq0c1hOZ/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 010',1109,
  'Da X Filez initial public still-image import. Original file: IMG_5809.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1cjGaCCprjz3pY8MRP14g8--cSq0c1hOZ/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1cjGaCCprjz3pY8MRP14g8--cSq0c1hOZ&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1H22THNkRCAd4ydy0BL81OWbQVTRYjowK','https://drive.google.com/file/d/1H22THNkRCAd4ydy0BL81OWbQVTRYjowK/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 011',1110,
  'Da X Filez initial public still-image import. Original file: IMG_5915.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1H22THNkRCAd4ydy0BL81OWbQVTRYjowK/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1H22THNkRCAd4ydy0BL81OWbQVTRYjowK&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1sWA3T1rLXufr5NC_RzaHNs-_ky3teJTH','https://drive.google.com/file/d/1sWA3T1rLXufr5NC_RzaHNs-_ky3teJTH/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 012',1111,
  'Da X Filez initial public still-image import. Original file: IMG_5916.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1sWA3T1rLXufr5NC_RzaHNs-_ky3teJTH/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1sWA3T1rLXufr5NC_RzaHNs-_ky3teJTH&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1MARzU-sn46q3C9gvVBdpgYd6onbkaVf8','https://drive.google.com/file/d/1MARzU-sn46q3C9gvVBdpgYd6onbkaVf8/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 013',1112,
  'Da X Filez initial public still-image import. Original file: IMG_5920.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1MARzU-sn46q3C9gvVBdpgYd6onbkaVf8/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1MARzU-sn46q3C9gvVBdpgYd6onbkaVf8&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1za4-YLm03RZcmihO0O0LpPHGOXE8jH9-','https://drive.google.com/file/d/1za4-YLm03RZcmihO0O0LpPHGOXE8jH9-/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 014',1113,
  'Da X Filez initial public still-image import. Original file: IMG_5921.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1za4-YLm03RZcmihO0O0LpPHGOXE8jH9-/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1za4-YLm03RZcmihO0O0LpPHGOXE8jH9-&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Poori8m1dF8H9WCDbT2HsXYpCO1zD8qF','https://drive.google.com/file/d/1Poori8m1dF8H9WCDbT2HsXYpCO1zD8qF/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 015',1114,
  'Da X Filez initial public still-image import. Original file: IMG_5922.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Poori8m1dF8H9WCDbT2HsXYpCO1zD8qF/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Poori8m1dF8H9WCDbT2HsXYpCO1zD8qF&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1ACF9k5Ave4g3hidU3GHSIWWQStrEWY7-','https://drive.google.com/file/d/1ACF9k5Ave4g3hidU3GHSIWWQStrEWY7-/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 016',1115,
  'Da X Filez initial public still-image import. Original file: IMG_5923.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1ACF9k5Ave4g3hidU3GHSIWWQStrEWY7-/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1ACF9k5Ave4g3hidU3GHSIWWQStrEWY7-&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1s3kzDngVWXVi-uX7jY1Wi72CrVY0Lb0q','https://drive.google.com/file/d/1s3kzDngVWXVi-uX7jY1Wi72CrVY0Lb0q/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 017',1116,
  'Da X Filez initial public still-image import. Original file: IMG_5924.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1s3kzDngVWXVi-uX7jY1Wi72CrVY0Lb0q/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1s3kzDngVWXVi-uX7jY1Wi72CrVY0Lb0q&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1aqkpteSLP26dk9Gl8kI7VrUDDC9Alj3B','https://drive.google.com/file/d/1aqkpteSLP26dk9Gl8kI7VrUDDC9Alj3B/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 018',1117,
  'Da X Filez initial public still-image import. Original file: IMG_5925.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1aqkpteSLP26dk9Gl8kI7VrUDDC9Alj3B/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1aqkpteSLP26dk9Gl8kI7VrUDDC9Alj3B&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','18etVPk3SPqFvNnlfsx4qejbG2kqYWdMP','https://drive.google.com/file/d/18etVPk3SPqFvNnlfsx4qejbG2kqYWdMP/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 019',1118,
  'Da X Filez initial public still-image import. Original file: IMG_5926.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/18etVPk3SPqFvNnlfsx4qejbG2kqYWdMP/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=18etVPk3SPqFvNnlfsx4qejbG2kqYWdMP&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Ykwb_5vj70iNI8ARe-WT8E8lwgfjzXSf','https://drive.google.com/file/d/1Ykwb_5vj70iNI8ARe-WT8E8lwgfjzXSf/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 020',1119,
  'Da X Filez initial public still-image import. Original file: IMG_5927.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Ykwb_5vj70iNI8ARe-WT8E8lwgfjzXSf/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Ykwb_5vj70iNI8ARe-WT8E8lwgfjzXSf&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','18uRADlIYKJgEfbQOLDvwYcrQmPyd9409','https://drive.google.com/file/d/18uRADlIYKJgEfbQOLDvwYcrQmPyd9409/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 021',1120,
  'Da X Filez initial public still-image import. Original file: IMG_5928.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/18uRADlIYKJgEfbQOLDvwYcrQmPyd9409/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=18uRADlIYKJgEfbQOLDvwYcrQmPyd9409&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','16fzX3J6BUXbMXY_J7_i-E9hEt-pBkOgr','https://drive.google.com/file/d/16fzX3J6BUXbMXY_J7_i-E9hEt-pBkOgr/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 022',1121,
  'Da X Filez initial public still-image import. Original file: IMG_5929.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/16fzX3J6BUXbMXY_J7_i-E9hEt-pBkOgr/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=16fzX3J6BUXbMXY_J7_i-E9hEt-pBkOgr&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1GO6fMKjtls0LFrshpVxXqkIYIYa5UHZ6','https://drive.google.com/file/d/1GO6fMKjtls0LFrshpVxXqkIYIYa5UHZ6/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 023',1122,
  'Da X Filez initial public still-image import. Original file: IMG_5930.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1GO6fMKjtls0LFrshpVxXqkIYIYa5UHZ6/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1GO6fMKjtls0LFrshpVxXqkIYIYa5UHZ6&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1DZ6hynM2G4yeLanmcaBf-HB-w1kVEfA7','https://drive.google.com/file/d/1DZ6hynM2G4yeLanmcaBf-HB-w1kVEfA7/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 024',1123,
  'Da X Filez initial public still-image import. Original file: IMG_5935.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1DZ6hynM2G4yeLanmcaBf-HB-w1kVEfA7/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1DZ6hynM2G4yeLanmcaBf-HB-w1kVEfA7&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1CLMDiL-Gca8vxhnE343PIfPGXjfYmVh_','https://drive.google.com/file/d/1CLMDiL-Gca8vxhnE343PIfPGXjfYmVh_/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 025',1124,
  'Da X Filez initial public still-image import. Original file: IMG_5936.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1CLMDiL-Gca8vxhnE343PIfPGXjfYmVh_/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1CLMDiL-Gca8vxhnE343PIfPGXjfYmVh_&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1hzrxHrC-rp5QCky9MIT2h5LCFUkbL3KD','https://drive.google.com/file/d/1hzrxHrC-rp5QCky9MIT2h5LCFUkbL3KD/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 026',1125,
  'Da X Filez initial public still-image import. Original file: IMG_5939.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1hzrxHrC-rp5QCky9MIT2h5LCFUkbL3KD/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1hzrxHrC-rp5QCky9MIT2h5LCFUkbL3KD&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Ri7E9kmZ0mRvIwYAH2ITp5Yj6mo_LkeF','https://drive.google.com/file/d/1Ri7E9kmZ0mRvIwYAH2ITp5Yj6mo_LkeF/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 027',1126,
  'Da X Filez initial public still-image import. Original file: IMG_5940.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Ri7E9kmZ0mRvIwYAH2ITp5Yj6mo_LkeF/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Ri7E9kmZ0mRvIwYAH2ITp5Yj6mo_LkeF&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1MkMLYlyH_fBEO0ZZjIptUo7GnSX7uXAd','https://drive.google.com/file/d/1MkMLYlyH_fBEO0ZZjIptUo7GnSX7uXAd/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 028',1127,
  'Da X Filez initial public still-image import. Original file: IMG_5941.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1MkMLYlyH_fBEO0ZZjIptUo7GnSX7uXAd/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1MkMLYlyH_fBEO0ZZjIptUo7GnSX7uXAd&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1oHa-ckIGjJdqz7DxxbOfkxw0balxTQzo','https://drive.google.com/file/d/1oHa-ckIGjJdqz7DxxbOfkxw0balxTQzo/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 029',1128,
  'Da X Filez initial public still-image import. Original file: IMG_5942.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1oHa-ckIGjJdqz7DxxbOfkxw0balxTQzo/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1oHa-ckIGjJdqz7DxxbOfkxw0balxTQzo&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1T91Wooz49GQRqBuEwREJJenXHIeLx3r5','https://drive.google.com/file/d/1T91Wooz49GQRqBuEwREJJenXHIeLx3r5/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 030',1129,
  'Da X Filez initial public still-image import. Original file: IMG_5943.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1T91Wooz49GQRqBuEwREJJenXHIeLx3r5/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1T91Wooz49GQRqBuEwREJJenXHIeLx3r5&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1A5DNcmdVoRw0ayaGQsgFX2ysfjShkZNr','https://drive.google.com/file/d/1A5DNcmdVoRw0ayaGQsgFX2ysfjShkZNr/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 031',1130,
  'Da X Filez initial public still-image import. Original file: IMG_5944.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1A5DNcmdVoRw0ayaGQsgFX2ysfjShkZNr/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1A5DNcmdVoRw0ayaGQsgFX2ysfjShkZNr&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Ve3X0hhKIVfkstsw-5kGIeBs9C8dfaJx','https://drive.google.com/file/d/1Ve3X0hhKIVfkstsw-5kGIeBs9C8dfaJx/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 032',1131,
  'Da X Filez initial public still-image import. Original file: IMG_5945.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Ve3X0hhKIVfkstsw-5kGIeBs9C8dfaJx/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Ve3X0hhKIVfkstsw-5kGIeBs9C8dfaJx&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1X3BKuiVvlzEI7zuigTI-AWUK4Sa66ndL','https://drive.google.com/file/d/1X3BKuiVvlzEI7zuigTI-AWUK4Sa66ndL/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 033',1132,
  'Da X Filez initial public still-image import. Original file: IMG_5946.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1X3BKuiVvlzEI7zuigTI-AWUK4Sa66ndL/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1X3BKuiVvlzEI7zuigTI-AWUK4Sa66ndL&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1WO-y3A2ZfxhueMXfCQuh-70zlrEcJvKX','https://drive.google.com/file/d/1WO-y3A2ZfxhueMXfCQuh-70zlrEcJvKX/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 034',1133,
  'Da X Filez initial public still-image import. Original file: IMG_5947.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1WO-y3A2ZfxhueMXfCQuh-70zlrEcJvKX/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1WO-y3A2ZfxhueMXfCQuh-70zlrEcJvKX&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1wcHinJ8EbmlGVHl9l98Y0bZnWxWFmgr8','https://drive.google.com/file/d/1wcHinJ8EbmlGVHl9l98Y0bZnWxWFmgr8/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 035',1134,
  'Da X Filez initial public still-image import. Original file: IMG_5948.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1wcHinJ8EbmlGVHl9l98Y0bZnWxWFmgr8/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1wcHinJ8EbmlGVHl9l98Y0bZnWxWFmgr8&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1J6g8nl5-XlCSJ-TpORNryy6y2Pu52OwA','https://drive.google.com/file/d/1J6g8nl5-XlCSJ-TpORNryy6y2Pu52OwA/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 036',1135,
  'Da X Filez initial public still-image import. Original file: IMG_5949.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1J6g8nl5-XlCSJ-TpORNryy6y2Pu52OwA/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1J6g8nl5-XlCSJ-TpORNryy6y2Pu52OwA&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1W4PFCgSpc_i0HK7QfUj8F0EIXIgSoN7M','https://drive.google.com/file/d/1W4PFCgSpc_i0HK7QfUj8F0EIXIgSoN7M/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 037',1136,
  'Da X Filez initial public still-image import. Original file: IMG_5950.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1W4PFCgSpc_i0HK7QfUj8F0EIXIgSoN7M/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1W4PFCgSpc_i0HK7QfUj8F0EIXIgSoN7M&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1RLmHH0rQgF9WvRa_WQ53SMaPNDBsOM88','https://drive.google.com/file/d/1RLmHH0rQgF9WvRa_WQ53SMaPNDBsOM88/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 038',1137,
  'Da X Filez initial public still-image import. Original file: IMG_5951.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1RLmHH0rQgF9WvRa_WQ53SMaPNDBsOM88/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1RLmHH0rQgF9WvRa_WQ53SMaPNDBsOM88&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1jSY7fXxz-qgQEbpfdeEprkeV4hR-uTzT','https://drive.google.com/file/d/1jSY7fXxz-qgQEbpfdeEprkeV4hR-uTzT/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 039',1138,
  'Da X Filez initial public still-image import. Original file: IMG_5952.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1jSY7fXxz-qgQEbpfdeEprkeV4hR-uTzT/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1jSY7fXxz-qgQEbpfdeEprkeV4hR-uTzT&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1MNukwAJR6_qC0fxXus-VIaE5uxyrTKn1','https://drive.google.com/file/d/1MNukwAJR6_qC0fxXus-VIaE5uxyrTKn1/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 040',1139,
  'Da X Filez initial public still-image import. Original file: IMG_5953.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1MNukwAJR6_qC0fxXus-VIaE5uxyrTKn1/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1MNukwAJR6_qC0fxXus-VIaE5uxyrTKn1&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','12-UOxGKR7b-_2QGJZmILMToppXPMq1n5','https://drive.google.com/file/d/12-UOxGKR7b-_2QGJZmILMToppXPMq1n5/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 041',1140,
  'Da X Filez initial public still-image import. Original file: IMG_5954.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/12-UOxGKR7b-_2QGJZmILMToppXPMq1n5/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=12-UOxGKR7b-_2QGJZmILMToppXPMq1n5&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','17eOdIsugiE2-yCN4_f50EA-ehuYjFd3_','https://drive.google.com/file/d/17eOdIsugiE2-yCN4_f50EA-ehuYjFd3_/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 042',1141,
  'Da X Filez initial public still-image import. Original file: IMG_5955.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/17eOdIsugiE2-yCN4_f50EA-ehuYjFd3_/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=17eOdIsugiE2-yCN4_f50EA-ehuYjFd3_&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','13UBymR3AiSCJwflGeUJKFLAchUQUBCZx','https://drive.google.com/file/d/13UBymR3AiSCJwflGeUJKFLAchUQUBCZx/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 043',1142,
  'Da X Filez initial public still-image import. Original file: IMG_5968.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/13UBymR3AiSCJwflGeUJKFLAchUQUBCZx/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=13UBymR3AiSCJwflGeUJKFLAchUQUBCZx&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1VaVKF8ZpTAUEIDbrTpTYMLEARQkWgJWu','https://drive.google.com/file/d/1VaVKF8ZpTAUEIDbrTpTYMLEARQkWgJWu/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 044',1143,
  'Da X Filez initial public still-image import. Original file: IMG_5969.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1VaVKF8ZpTAUEIDbrTpTYMLEARQkWgJWu/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1VaVKF8ZpTAUEIDbrTpTYMLEARQkWgJWu&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1tgbTlDla25CMYaYOj7pfFpIpNVnZiwr6','https://drive.google.com/file/d/1tgbTlDla25CMYaYOj7pfFpIpNVnZiwr6/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 045',1144,
  'Da X Filez initial public still-image import. Original file: IMG_5970.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1tgbTlDla25CMYaYOj7pfFpIpNVnZiwr6/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1tgbTlDla25CMYaYOj7pfFpIpNVnZiwr6&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1g42FfcYNUJaj4S986-X4V7Qg8wuRWyxB','https://drive.google.com/file/d/1g42FfcYNUJaj4S986-X4V7Qg8wuRWyxB/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 046',1145,
  'Da X Filez initial public still-image import. Original file: IMG_5971.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1g42FfcYNUJaj4S986-X4V7Qg8wuRWyxB/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1g42FfcYNUJaj4S986-X4V7Qg8wuRWyxB&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1XRhs2c5gUXUw7rauMme7RpvrIirhm1Sb','https://drive.google.com/file/d/1XRhs2c5gUXUw7rauMme7RpvrIirhm1Sb/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 047',1146,
  'Da X Filez initial public still-image import. Original file: IMG_5972.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1XRhs2c5gUXUw7rauMme7RpvrIirhm1Sb/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1XRhs2c5gUXUw7rauMme7RpvrIirhm1Sb&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1lAZe-O9391izECF6l2dxgMsaMrVd7JTf','https://drive.google.com/file/d/1lAZe-O9391izECF6l2dxgMsaMrVd7JTf/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 048',1147,
  'Da X Filez initial public still-image import. Original file: IMG_5973.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1lAZe-O9391izECF6l2dxgMsaMrVd7JTf/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1lAZe-O9391izECF6l2dxgMsaMrVd7JTf&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1PIAb3OajsINbGNc5s-hHNbu8urHVqU-L','https://drive.google.com/file/d/1PIAb3OajsINbGNc5s-hHNbu8urHVqU-L/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 049',1148,
  'Da X Filez initial public still-image import. Original file: IMG_5974.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1PIAb3OajsINbGNc5s-hHNbu8urHVqU-L/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1PIAb3OajsINbGNc5s-hHNbu8urHVqU-L&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1rGbrqK59c-y-7nkx76NiP9SAGdww20Wv','https://drive.google.com/file/d/1rGbrqK59c-y-7nkx76NiP9SAGdww20Wv/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 050',1149,
  'Da X Filez initial public still-image import. Original file: IMG_5975.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1rGbrqK59c-y-7nkx76NiP9SAGdww20Wv/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1rGbrqK59c-y-7nkx76NiP9SAGdww20Wv&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1px2AJRIAlCO0Dkztm_qC15XgEz2itmv2','https://drive.google.com/file/d/1px2AJRIAlCO0Dkztm_qC15XgEz2itmv2/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 051',1150,
  'Da X Filez initial public still-image import. Original file: IMG_5976.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1px2AJRIAlCO0Dkztm_qC15XgEz2itmv2/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1px2AJRIAlCO0Dkztm_qC15XgEz2itmv2&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Yo-UZ20I8ZvlobRIhMn4R-BZhVzl7pzk','https://drive.google.com/file/d/1Yo-UZ20I8ZvlobRIhMn4R-BZhVzl7pzk/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 052',1151,
  'Da X Filez initial public still-image import. Original file: IMG_5977.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Yo-UZ20I8ZvlobRIhMn4R-BZhVzl7pzk/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Yo-UZ20I8ZvlobRIhMn4R-BZhVzl7pzk&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1XmQAARwMBKuNsj1oJTP5_N8pxPUNz_kJ','https://drive.google.com/file/d/1XmQAARwMBKuNsj1oJTP5_N8pxPUNz_kJ/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 053',1152,
  'Da X Filez initial public still-image import. Original file: IMG_5978.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1XmQAARwMBKuNsj1oJTP5_N8pxPUNz_kJ/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1XmQAARwMBKuNsj1oJTP5_N8pxPUNz_kJ&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1QHpC9TRMn5OkcLXP7cp5SyE6XqDXQ1zG','https://drive.google.com/file/d/1QHpC9TRMn5OkcLXP7cp5SyE6XqDXQ1zG/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 054',1153,
  'Da X Filez initial public still-image import. Original file: IMG_5979.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1QHpC9TRMn5OkcLXP7cp5SyE6XqDXQ1zG/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1QHpC9TRMn5OkcLXP7cp5SyE6XqDXQ1zG&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1RBhzEZdyk1AW7gDu9C39InHcOYXN5Zpl','https://drive.google.com/file/d/1RBhzEZdyk1AW7gDu9C39InHcOYXN5Zpl/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 055',1154,
  'Da X Filez initial public still-image import. Original file: IMG_5980.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1RBhzEZdyk1AW7gDu9C39InHcOYXN5Zpl/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1RBhzEZdyk1AW7gDu9C39InHcOYXN5Zpl&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1zyuANRJnLHKKDkzzqH2RaqhrnuqGVJ74','https://drive.google.com/file/d/1zyuANRJnLHKKDkzzqH2RaqhrnuqGVJ74/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 056',1155,
  'Da X Filez initial public still-image import. Original file: IMG_5981.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1zyuANRJnLHKKDkzzqH2RaqhrnuqGVJ74/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1zyuANRJnLHKKDkzzqH2RaqhrnuqGVJ74&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1FXd-T4UAmutTQFjoJO2kEX50-D-I1pNr','https://drive.google.com/file/d/1FXd-T4UAmutTQFjoJO2kEX50-D-I1pNr/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 057',1156,
  'Da X Filez initial public still-image import. Original file: IMG_5982.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1FXd-T4UAmutTQFjoJO2kEX50-D-I1pNr/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1FXd-T4UAmutTQFjoJO2kEX50-D-I1pNr&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1uDQoy4yhWKYil--CjoePL-GJpNuksbHR','https://drive.google.com/file/d/1uDQoy4yhWKYil--CjoePL-GJpNuksbHR/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 058',1157,
  'Da X Filez initial public still-image import. Original file: IMG_5983.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1uDQoy4yhWKYil--CjoePL-GJpNuksbHR/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1uDQoy4yhWKYil--CjoePL-GJpNuksbHR&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Cz2od7BM2G0UaeYHi30j3C4Xas6RVKvO','https://drive.google.com/file/d/1Cz2od7BM2G0UaeYHi30j3C4Xas6RVKvO/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 059',1158,
  'Da X Filez initial public still-image import. Original file: IMG_5984.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Cz2od7BM2G0UaeYHi30j3C4Xas6RVKvO/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Cz2od7BM2G0UaeYHi30j3C4Xas6RVKvO&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1uH4ndJXit9l9I-oiMeFiiMy193WNYKhE','https://drive.google.com/file/d/1uH4ndJXit9l9I-oiMeFiiMy193WNYKhE/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 060',1159,
  'Da X Filez initial public still-image import. Original file: IMG_5985.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1uH4ndJXit9l9I-oiMeFiiMy193WNYKhE/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1uH4ndJXit9l9I-oiMeFiiMy193WNYKhE&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1DnOQxGQYbABYjvhrKfdw8BZmcaD1vLee','https://drive.google.com/file/d/1DnOQxGQYbABYjvhrKfdw8BZmcaD1vLee/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 061',1160,
  'Da X Filez initial public still-image import. Original file: IMG_5986.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1DnOQxGQYbABYjvhrKfdw8BZmcaD1vLee/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1DnOQxGQYbABYjvhrKfdw8BZmcaD1vLee&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1naZNx0ZAvRt1cv2J3hS_M9XIC5HMQDAO','https://drive.google.com/file/d/1naZNx0ZAvRt1cv2J3hS_M9XIC5HMQDAO/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 062',1161,
  'Da X Filez initial public still-image import. Original file: IMG_5987.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1naZNx0ZAvRt1cv2J3hS_M9XIC5HMQDAO/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1naZNx0ZAvRt1cv2J3hS_M9XIC5HMQDAO&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','19TTyAUNEjdydgGYwUAShdU1DLuXNLLwW','https://drive.google.com/file/d/19TTyAUNEjdydgGYwUAShdU1DLuXNLLwW/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 063',1162,
  'Da X Filez initial public still-image import. Original file: IMG_5988.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/19TTyAUNEjdydgGYwUAShdU1DLuXNLLwW/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=19TTyAUNEjdydgGYwUAShdU1DLuXNLLwW&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','170F3gKUq9Da0slq5hdCSa1bCGic-khPy','https://drive.google.com/file/d/170F3gKUq9Da0slq5hdCSa1bCGic-khPy/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 064',1163,
  'Da X Filez initial public still-image import. Original file: IMG_5989.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/170F3gKUq9Da0slq5hdCSa1bCGic-khPy/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=170F3gKUq9Da0slq5hdCSa1bCGic-khPy&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1xbsim13OTXQlZp--xgBS9ulBb-cfnBHa','https://drive.google.com/file/d/1xbsim13OTXQlZp--xgBS9ulBb-cfnBHa/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 065',1164,
  'Da X Filez initial public still-image import. Original file: IMG_5990.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1xbsim13OTXQlZp--xgBS9ulBb-cfnBHa/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1xbsim13OTXQlZp--xgBS9ulBb-cfnBHa&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1Dg0GczMK2aBstpAaaKcMCOb_2tX-GQ1c','https://drive.google.com/file/d/1Dg0GczMK2aBstpAaaKcMCOb_2tX-GQ1c/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 066',1165,
  'Da X Filez initial public still-image import. Original file: IMG_5991.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1Dg0GczMK2aBstpAaaKcMCOb_2tX-GQ1c/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1Dg0GczMK2aBstpAaaKcMCOb_2tX-GQ1c&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1eEHbIFN87DrtCtMYLF4GOjF2rryFyydN','https://drive.google.com/file/d/1eEHbIFN87DrtCtMYLF4GOjF2rryFyydN/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 067',1166,
  'Da X Filez initial public still-image import. Original file: IMG_5992.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1eEHbIFN87DrtCtMYLF4GOjF2rryFyydN/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1eEHbIFN87DrtCtMYLF4GOjF2rryFyydN&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','17fFoCyiBBcSyLU-gDaUje6j6m8gwdLwf','https://drive.google.com/file/d/17fFoCyiBBcSyLU-gDaUje6j6m8gwdLwf/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 068',1167,
  'Da X Filez initial public still-image import. Original file: IMG_5993.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/17fFoCyiBBcSyLU-gDaUje6j6m8gwdLwf/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=17fFoCyiBBcSyLU-gDaUje6j6m8gwdLwf&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','16gTmw2gD3X-VfREdcZNHv_u68q3vjtlt','https://drive.google.com/file/d/16gTmw2gD3X-VfREdcZNHv_u68q3vjtlt/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 069',1168,
  'Da X Filez initial public still-image import. Original file: IMG_5994.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/16gTmw2gD3X-VfREdcZNHv_u68q3vjtlt/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=16gTmw2gD3X-VfREdcZNHv_u68q3vjtlt&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1ldO8I9vC2M_cQNhGXnmNDeHhnc80NGgv','https://drive.google.com/file/d/1ldO8I9vC2M_cQNhGXnmNDeHhnc80NGgv/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 070',1169,
  'Da X Filez initial public still-image import. Original file: IMG_5995.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1ldO8I9vC2M_cQNhGXnmNDeHhnc80NGgv/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1ldO8I9vC2M_cQNhGXnmNDeHhnc80NGgv&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1zWoQDxAtm1tuYLmKO82bqF0nvgmGA9BH','https://drive.google.com/file/d/1zWoQDxAtm1tuYLmKO82bqF0nvgmGA9BH/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 071',1170,
  'Da X Filez initial public still-image import. Original file: IMG_5996.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1zWoQDxAtm1tuYLmKO82bqF0nvgmGA9BH/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1zWoQDxAtm1tuYLmKO82bqF0nvgmGA9BH&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1BbSW-smoVnaeOJAz4TcugE-EaOtx0j6B','https://drive.google.com/file/d/1BbSW-smoVnaeOJAz4TcugE-EaOtx0j6B/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 072',1171,
  'Da X Filez initial public still-image import. Original file: IMG_5997.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1BbSW-smoVnaeOJAz4TcugE-EaOtx0j6B/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1BbSW-smoVnaeOJAz4TcugE-EaOtx0j6B&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1BAqZ4135Yf3vOKprZGnmxsgA86RcYhoe','https://drive.google.com/file/d/1BAqZ4135Yf3vOKprZGnmxsgA86RcYhoe/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 073',1172,
  'Da X Filez initial public still-image import. Original file: IMG_5998.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1BAqZ4135Yf3vOKprZGnmxsgA86RcYhoe/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1BAqZ4135Yf3vOKprZGnmxsgA86RcYhoe&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','18eQNXpj_phH5NfQNgo76foabmFP0-Yua','https://drive.google.com/file/d/18eQNXpj_phH5NfQNgo76foabmFP0-Yua/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 074',1173,
  'Da X Filez initial public still-image import. Original file: IMG_5999.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/18eQNXpj_phH5NfQNgo76foabmFP0-Yua/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=18eQNXpj_phH5NfQNgo76foabmFP0-Yua&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1BXwewg6sq-Rv9ULMo71jnGuskCXyHnP-','https://drive.google.com/file/d/1BXwewg6sq-Rv9ULMo71jnGuskCXyHnP-/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 075',1174,
  'Da X Filez initial public still-image import. Original file: IMG_6000.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1BXwewg6sq-Rv9ULMo71jnGuskCXyHnP-/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1BXwewg6sq-Rv9ULMo71jnGuskCXyHnP-&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1KEHtHm6WGtMWMmLpHdwBuvQGxs0-rDIB','https://drive.google.com/file/d/1KEHtHm6WGtMWMmLpHdwBuvQGxs0-rDIB/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 076',1175,
  'Da X Filez initial public still-image import. Original file: IMG_6001.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1KEHtHm6WGtMWMmLpHdwBuvQGxs0-rDIB/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1KEHtHm6WGtMWMmLpHdwBuvQGxs0-rDIB&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1vrVXTQQxokeclZVhZqUKCe88K9nX2PSm','https://drive.google.com/file/d/1vrVXTQQxokeclZVhZqUKCe88K9nX2PSm/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 077',1176,
  'Da X Filez initial public still-image import. Original file: IMG_6002.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1vrVXTQQxokeclZVhZqUKCe88K9nX2PSm/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1vrVXTQQxokeclZVhZqUKCe88K9nX2PSm&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1f6NZuwB3KF99QkxPb4t1ShDv8jZd5hGr','https://drive.google.com/file/d/1f6NZuwB3KF99QkxPb4t1ShDv8jZd5hGr/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 078',1177,
  'Da X Filez initial public still-image import. Original file: IMG_6003.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1f6NZuwB3KF99QkxPb4t1ShDv8jZd5hGr/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1f6NZuwB3KF99QkxPb4t1ShDv8jZd5hGr&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1ZeaD-eDtGt8liHykOTDNn1qep9xr4NTj','https://drive.google.com/file/d/1ZeaD-eDtGt8liHykOTDNn1qep9xr4NTj/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 079',1178,
  'Da X Filez initial public still-image import. Original file: IMG_6004.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1ZeaD-eDtGt8liHykOTDNn1qep9xr4NTj/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1ZeaD-eDtGt8liHykOTDNn1qep9xr4NTj&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1tknFl1QPO1taIB67tYOnDtsZ_mQsQTlT','https://drive.google.com/file/d/1tknFl1QPO1taIB67tYOnDtsZ_mQsQTlT/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 080',1179,
  'Da X Filez initial public still-image import. Original file: IMG_6005.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1tknFl1QPO1taIB67tYOnDtsZ_mQsQTlT/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1tknFl1QPO1taIB67tYOnDtsZ_mQsQTlT&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1YuZfoPxIl1kGcF0YykQpRQ0LTm4Erhfd','https://drive.google.com/file/d/1YuZfoPxIl1kGcF0YykQpRQ0LTm4Erhfd/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 081',1180,
  'Da X Filez initial public still-image import. Original file: IMG_6006.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1YuZfoPxIl1kGcF0YykQpRQ0LTm4Erhfd/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1YuZfoPxIl1kGcF0YykQpRQ0LTm4Erhfd&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1eeFC69gRPa_aTIOxO9JzL3Q-BkKf-N_Y','https://drive.google.com/file/d/1eeFC69gRPa_aTIOxO9JzL3Q-BkKf-N_Y/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 082',1181,
  'Da X Filez initial public still-image import. Original file: IMG_6007.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1eeFC69gRPa_aTIOxO9JzL3Q-BkKf-N_Y/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1eeFC69gRPa_aTIOxO9JzL3Q-BkKf-N_Y&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','15Y1T-vacfQ0dbEbQUOVis_-Hj6zc58X-','https://drive.google.com/file/d/15Y1T-vacfQ0dbEbQUOVis_-Hj6zc58X-/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 083',1182,
  'Da X Filez initial public still-image import. Original file: IMG_6008.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/15Y1T-vacfQ0dbEbQUOVis_-Hj6zc58X-/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=15Y1T-vacfQ0dbEbQUOVis_-Hj6zc58X-&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1NQx4E7V8myrkFAQn-A7y8M5rWVuVdbL6','https://drive.google.com/file/d/1NQx4E7V8myrkFAQn-A7y8M5rWVuVdbL6/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 084',1183,
  'Da X Filez initial public still-image import. Original file: IMG_6009.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1NQx4E7V8myrkFAQn-A7y8M5rWVuVdbL6/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1NQx4E7V8myrkFAQn-A7y8M5rWVuVdbL6&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1FaLOMNWKt-r5ia9lIAUXPCRkWw5B5Sy4','https://drive.google.com/file/d/1FaLOMNWKt-r5ia9lIAUXPCRkWw5B5Sy4/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 085',1184,
  'Da X Filez initial public still-image import. Original file: IMG_6010.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1FaLOMNWKt-r5ia9lIAUXPCRkWw5B5Sy4/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1FaLOMNWKt-r5ia9lIAUXPCRkWw5B5Sy4&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','149Ej50eXcUjQ-r9aOH7gfBz9msYqD7Kn','https://drive.google.com/file/d/149Ej50eXcUjQ-r9aOH7gfBz9msYqD7Kn/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 086',1185,
  'Da X Filez initial public still-image import. Original file: IMG_6011.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/149Ej50eXcUjQ-r9aOH7gfBz9msYqD7Kn/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=149Ej50eXcUjQ-r9aOH7gfBz9msYqD7Kn&sz=w1600','first-party-crowd-archive'
),
(
  'google-drive','1VytVQc8SU6OihTsoEAgxy_rIl6ogJFxv','https://drive.google.com/file/d/1VytVQc8SU6OihTsoEAgxy_rIl6ogJFxv/view?usp=drivesdk',
  'X Tha God — Grizz Exam Archive 087',1186,
  'Da X Filez initial public still-image import. Original file: IMG_6012.JPG','The CROWD Drive — Grizz Exams / X Tha God','https://drive.google.com/file/d/1VytVQc8SU6OihTsoEAgxy_rIl6ogJFxv/view?usp=drivesdk',
  'https://drive.google.com/thumbnail?id=1VytVQc8SU6OihTsoEAgxy_rIl6ogJFxv&sz=w1600','first-party-crowd-archive'
)
)
INSERT INTO artist_media(
  artist_id,media_type,provider,external_id,canonical_url,title,event_date,
  era_slug,visibility,sort_order,active,description,source_name,source_url,
  thumbnail_url,rights_status,published_at
)
SELECT
  a.id,'photo',s.provider,s.external_id,s.canonical_url,s.title,NULL,
  'da-x-filez','public',s.sort_order,1,s.description,s.source_name,s.source_url,
  s.thumbnail_url,s.rights_status,NULL
FROM seed s
JOIN artists a ON a.artist_slug='x-tha-god'
WHERE NOT EXISTS(
  SELECT 1 FROM artist_media m
  WHERE m.provider=s.provider AND m.external_id=s.external_id
);

INSERT OR IGNORE INTO media_access_policy(
  media_id,access_state,teaser_mode,cypherz_visible,active
)
SELECT m.id,'public','visible',1,1
FROM artist_media m
WHERE m.artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND m.era_slug='da-x-filez'
  AND m.provider='google-drive';

UPDATE media_access_policy
SET access_state='public',
    house_slug=NULL,
    unlock_slug=NULL,
    teaser_mode='visible',
    cypherz_visible=1,
    active=1,
    updated_at=CURRENT_TIMESTAMP
WHERE media_id IN (
  SELECT id FROM artist_media
  WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
    AND era_slug='da-x-filez'
    AND provider='google-drive'
);

UPDATE artist_media
SET visibility='public'
WHERE artist_id=(SELECT id FROM artists WHERE artist_slug='x-tha-god')
  AND era_slug='da-x-filez'
  AND provider='google-drive';

INSERT OR IGNORE INTO player_media_collection_items(
  collection_id,media_id,is_primary,sort_order,active
)
SELECT c.id,m.id,1,m.sort_order,1
FROM player_media_collections c
JOIN artist_media m ON m.artist_id=c.artist_id
WHERE c.collection_slug='da-x-filez'
  AND m.era_slug='da-x-filez'
  AND m.provider='google-drive';
