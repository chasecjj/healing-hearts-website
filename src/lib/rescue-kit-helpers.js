// Rescue Kit Supabase client helpers
//
// Thin wrappers around the Supabase client for the 3 new persistence tables:
//   - assessment_results (append-only history)
//   - form_responses (upsert per user/lesson/form)
//   - practice_plan_progress (upsert per user/lesson/plan)
//
// All helpers return { data, error } matching the Supabase client conventions.
// RLS policies enforce that users can only CRUD their own rows — we pass userId
// explicitly but the RLS check is the source of truth.

// ===== ASSESSMENT RESULTS =====

/**
 * Save a new assessment result (append-only history).
 *
 * @param {object} supabase - Supabase client
 * @param {object} params
 * @param {string} params.userId - auth user id
 * @param {string} params.lessonId - lesson UUID
 * @param {string} params.assessmentId - assessment identifier (e.g. 'zones-resilience')
 * @param {object} params.responses - full response data
 * @param {number} params.totalScore - computed total score
 * @param {string} params.resultZone - computed zone (e.g. 'green', 'yellow_hyper')
 * @returns {Promise<{data, error}>}
 */
export async function saveAssessmentResult(supabase, {
  userId,
  lessonId,
  assessmentId,
  responses,
  totalScore,
  resultZone,
}) {
  const { data, error } = await supabase
    .from('assessment_results')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      assessment_id: assessmentId,
      responses,
      total_score: totalScore,
      result_zone: resultZone,
    })
    .select()
    .single();
  return { data, error };
}

/**
 * Load the latest assessment result for a given user + lesson + assessment.
 */
export async function loadLatestAssessmentResult(supabase, {
  userId,
  lessonId,
  assessmentId,
}) {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

/**
 * Load all assessment results for a user + lesson + assessment, newest first.
 */
export async function loadAssessmentHistory(supabase, {
  userId,
  lessonId,
  assessmentId,
}) {
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

// ===== FORM RESPONSES =====

/**
 * Save or update a form response (upsert on unique key).
 *
 * @param {object} supabase - Supabase client
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.lessonId
 * @param {string} params.formId
 * @param {object} params.fields - field values (freeform key-value)
 * @returns {Promise<{data, error}>}
 */
export async function saveFormResponse(supabase, {
  userId,
  lessonId,
  formId,
  fields,
}) {
  const { data, error } = await supabase
    .from('form_responses')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        form_id: formId,
        fields,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,lesson_id,form_id',
      }
    )
    .select()
    .single();
  return { data, error };
}

/**
 * Load the form response for a given user + lesson + form, if any.
 */
export async function loadFormResponse(supabase, {
  userId,
  lessonId,
  formId,
}) {
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('form_id', formId)
    .maybeSingle();
  return { data, error };
}

// ===== PRACTICE PLAN PROGRESS =====

/**
 * Save or update practice plan progress (upsert on unique key).
 */
export async function savePracticePlanProgress(supabase, {
  userId,
  lessonId,
  planId,
  daysCompleted,
  notesPerDay,
}) {
  const { data, error } = await supabase
    .from('practice_plan_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        plan_id: planId,
        days_completed: daysCompleted,
        notes_per_day: notesPerDay,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,lesson_id,plan_id',
      }
    )
    .select()
    .single();
  return { data, error };
}

/**
 * Load the practice plan progress for a given user + lesson + plan, if any.
 */
export async function loadPracticePlanProgress(supabase, {
  userId,
  lessonId,
  planId,
}) {
  const { data, error } = await supabase
    .from('practice_plan_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('plan_id', planId)
    .maybeSingle();
  return { data, error };
}
