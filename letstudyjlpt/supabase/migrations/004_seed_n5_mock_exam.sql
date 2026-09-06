-- Original demo content only. Do not replace this with copyrighted exam material without permission.

insert into public.exam_templates (level, name, is_active)
select 'N5', 'JLPT N5 Standard Demo Template', true
where not exists (select 1 from public.exam_templates where level = 'N5' and name = 'JLPT N5 Standard Demo Template');

insert into public.exam_template_parts (template_id, section_type, question_type, required_question_count, order_number)
select template.id, part.section_type, part.question_type, part.required_question_count, part.order_number
from public.exam_templates template
cross join (values
  ('moji_goi', 'kanji_reading', 1, 1),
  ('moji_goi', 'context_vocabulary', 1, 2),
  ('grammar_reading', 'sentence_grammar', 1, 3),
  ('grammar_reading', 'short_reading', 1, 4),
  ('listening', 'listening_task', 1, 5)
) as part(section_type, question_type, required_question_count, order_number)
where template.level = 'N5' and template.name = 'JLPT N5 Standard Demo Template'
  and not exists (
    select 1 from public.exam_template_parts existing
    where existing.template_id = template.id and existing.order_number = part.order_number
  );

insert into public.yearly_exams (level, year, title, is_published)
select 'N5', 2024, 'JLPT N5 Original Practice Set 2024', true
where not exists (select 1 from public.yearly_exams where level = 'N5' and year = 2024);

insert into public.questions (test_id, category, section_type, question_type, question_number, question_text, explanation, correct_answer, level, source_year, is_active)
select null, question.category, question.section_type, question.question_type, question.question_number, question.question_text, question.explanation, question.correct_answer, 'N5', 2024, true
from (values
  ('Vocabulary', 'moji_goi', 'kanji_reading', 1, '「山」の読み方はどれですか。', '山 is read as やま.', 'A'),
  ('Vocabulary', 'moji_goi', 'context_vocabulary', 2, '毎朝、みずを（　　）。', 'The natural verb is 飲みます.', 'A'),
  ('Grammar', 'grammar_reading', 'sentence_grammar', 3, 'これは わたし（　　）本です。', 'の marks possession.', 'B'),
  ('Reading', 'grammar_reading', 'short_reading', 4, '図書館は月曜日が休みです。図書館はいつ休みですか。', 'The notice says Monday.', 'A'),
  ('Listening', 'listening', 'listening_task', 5, '男の人は何を買いますか。', 'This original demo uses bread as the answer.', 'A')
) as question(category, section_type, question_type, question_number, question_text, explanation, correct_answer)
where not exists (select 1 from public.questions existing where existing.source_year = 2024 and existing.question_number = question.question_number and existing.question_text = question.question_text);

insert into public.choices (question_id, choice_key, choice_text)
select question.id, choice.choice_key, choice.choice_text
from public.questions question
join (values
  ('「山」の読み方はどれですか。', 'A', 'やま'), ('「山」の読み方はどれですか。', 'B', 'かわ'), ('「山」の読み方はどれですか。', 'C', 'そら'), ('「山」の読み方はどれですか。', 'D', 'うみ'),
  ('毎朝、みずを（　　）。', 'A', '飲みます'), ('毎朝、みずを（　　）。', 'B', '見ます'), ('毎朝、みずを（　　）。', 'C', '読みます'), ('毎朝、みずを（　　）。', 'D', '聞きます'),
  ('これは わたし（　　）本です。', 'A', 'を'), ('これは わたし（　　）本です。', 'B', 'の'), ('これは わたし（　　）本です。', 'C', 'に'), ('これは わたし（　　）本です。', 'D', 'が'),
  ('図書館は月曜日が休みです。図書館はいつ休みですか。', 'A', '月曜日'), ('図書館は月曜日が休みです。図書館はいつ休みですか。', 'B', '火曜日'), ('図書館は月曜日が休みです。図書館はいつ休みですか。', 'C', '土曜日'), ('図書館は月曜日が休みです。図書館はいつ休みですか。', 'D', '日曜日'),
  ('男の人は何を買いますか。', 'A', 'パン'), ('男の人は何を買いますか。', 'B', '本'), ('男の人は何を買いますか。', 'C', '水'), ('男の人は何を買いますか。', 'D', '花')
) as choice(question_text, choice_key, choice_text) on choice.question_text = question.question_text
where question.source_year = 2024
  and not exists (select 1 from public.choices existing where existing.question_id = question.id and existing.choice_key = choice.choice_key);

insert into public.yearly_exam_questions (yearly_exam_id, question_id, section_order, question_order)
select exam.id, question.id,
  case question.section_type when 'moji_goi' then 1 when 'grammar_reading' then 2 else 3 end,
  question.question_number
from public.yearly_exams exam
join public.questions question on question.source_year = exam.year and question.level = exam.level and question.is_active
where exam.level = 'N5' and exam.year = 2024
  and not exists (select 1 from public.yearly_exam_questions existing where existing.yearly_exam_id = exam.id and existing.question_id = question.id);
