insert into public.tests (title, description, duration_minutes, is_premium, is_active) values
  ('N5 Starter Check', 'A short confidence-building set across the four N5 sections.', 20, false, true),
  ('Full Simulation 01', 'A complete original practice paper with exam-style pacing.', 60, true, true);

with test_row as (select id from public.tests where title = 'N5 Starter Check' limit 1)
insert into public.questions (test_id, section, question_number, question_text, question_type, explanation, points)
select test_row.id, question.section, question.number, question.text, 'multiple_choice', question.explanation, 1
from test_row cross join (values
  ('Vocabulary', 1, 'わたしは毎朝 ______ を飲みます。', '水 means water.'),
  ('Vocabulary', 2, '「大きい」の反対は何ですか。', '小さい means small.'),
  ('Grammar', 3, 'これは だれ ______ かばんですか。', 'の connects a person and their possession.'),
  ('Grammar', 4, '日曜日 ______ 映画を見ました。', 'に marks a specific time.'),
  ('Reading', 5, '【図書館のお知らせ】月曜日は休みです。図書館はいつ休みですか。', 'The notice says Monday is closed.'),
  ('Reading', 6, '田中さんは毎朝コーヒーを飲みます。何を飲みますか。', 'The passage says coffee.'),
  ('Listening', 7, '音声を聞いて、正しい答えを選んでください。', 'This placeholder answer is station.'),
  ('Listening', 8, '音声を聞いて、女性が買うものを選んでください。', 'This placeholder answer is bread.')
) as question(section, number, text, explanation);

with question_rows as (select q.id, q.question_number from public.questions q join public.tests t on t.id = q.test_id where t.title = 'N5 Starter Check')
insert into public.choices (question_id, choice_key, choice_text, is_correct)
select question_rows.id, choice.choice_key, choice.choice_text,
  choice.choice_key = case question_rows.question_number
    when 1 then 'A' when 2 then 'A' when 3 then 'A' when 4 then 'A'
    when 5 then 'A' when 6 then 'C' when 7 then 'A' when 8 then 'B'
  end
from question_rows cross join (values ('A','水'),('B','本'),('C','車'),('D','学校')) as choice(choice_key, choice_text);