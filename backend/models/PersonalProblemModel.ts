import mongoose, { Document, Schema } from "mongoose";

interface PersonalProblem extends Document {
  stress?: boolean;
  anger?: boolean;
  emotional_problem?: boolean;
  low_self_esteem?: boolean;
  examination_anxiety?: boolean;
  negative_thoughts?: boolean;
  exam_phobia?: boolean;
  stammering?: boolean;
  financial_problem?: boolean;
  mood_swings?: boolean;

  disturbed_relationship?: {
    with_parents?: boolean;
    with_teachers?: boolean;
    with_friends?: boolean;
  };

  disciplinary_problems_in_college?: boolean;
  poor_command_of_english?: boolean;
  tobacco_or_alcohol_use?: boolean;
  suicidal_attempts_or_thoughts?: boolean;
  disappointment_with_courses?: boolean;
  time_management_problem?: boolean;
  relationship_problem?: boolean;
  low_self_motivation?: boolean;
  conflits?: boolean;
  procrastination?: boolean;
  frustration?: boolean;
  poor_decisive_power?: boolean;
  adjustment_problem?: boolean;
  lack_of_expression?: boolean;
  poor_concentration?: boolean;
  stage_phobia?: boolean;
  worries_about_future?: boolean;
  poor_memory_problem?: boolean;
  migraine_headache?: boolean;
  fear_of_public_speaking?: boolean;
}

const personalProblemSchema: Schema<PersonalProblem> = new mongoose.Schema({
  stress: { type: Boolean },
  anger: { type: Boolean },
  emotional_problem: { type: Boolean },
  low_self_esteem: { type: Boolean },
  examination_anxiety: { type: Boolean },
  negative_thoughts: { type: Boolean },
  exam_phobia: { type: Boolean },
  stammering: { type: Boolean },
  financial_problem: { type: Boolean },
  mood_swings: { type: Boolean },

  disturbed_relationship: {
    with_parents: { type: Boolean },
    with_teachers: { type: Boolean },
    with_friends: { type: Boolean },
  },

  disciplinary_problems_in_college: { type: Boolean },
  poor_command_of_english: { type: Boolean },
  tobacco_or_alcohol_use: { type: Boolean },
  suicidal_attempts_or_thoughts: { type: Boolean },
  disappointment_with_courses: { type: Boolean },
  time_management_problem: { type: Boolean },
  relationship_problem: { type: Boolean },
  low_self_motivation: { type: Boolean },
  conflits: { type: Boolean },
  procrastination: { type: Boolean },
  frustration: { type: Boolean },
  poor_decisive_power: { type: Boolean },
  adjustment_problem: { type: Boolean },
  lack_of_expression: { type: Boolean },
  poor_concentration: { type: Boolean },
  stage_phobia: { type: Boolean },
  worries_about_future: { type: Boolean },
  poor_memory_problem: { type: Boolean },
  migraine_headache: { type: Boolean },
  fear_of_public_speaking: { type: Boolean },
});

const PersonalProblemModel = mongoose.model<PersonalProblem>("PersonalProblem", personalProblemSchema);

export default PersonalProblemModel;