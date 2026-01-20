import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Question {
  questionId: string;
  question: string;
  options: string[];
  difficulty: number;
}

interface TestState {
  testId: string | null;
  uniqueUrl: string | null;
  currentQuestion: Question | null;
  score: number;
  totalQuestions: number;
  isTestCompleted: boolean;
  completionReason: string | null;
  testStatus: 'idle' | 'in-progress' | 'completed';
}

const initialState: TestState = {
  testId: null,
  uniqueUrl: null,
  currentQuestion: null,
  score: 0,
  totalQuestions: 0,
  isTestCompleted: false,
  completionReason: null,
  testStatus: 'idle',
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTestInfo: (state, action: PayloadAction<{ testId: string; uniqueUrl: string }>) => {
      state.testId = action.payload.testId;
      state.uniqueUrl = action.payload.uniqueUrl;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.testStatus = 'in-progress';
    },
    updateTestProgress: (
      state,
      action: PayloadAction<{
        score: number;
        totalQuestions: number;
        isTestCompleted: boolean;
        completionReason?: string;
        nextQuestion?: Question;
      }>
    ) => {
      state.score = action.payload.score;
      state.totalQuestions = action.payload.totalQuestions;
      state.isTestCompleted = action.payload.isTestCompleted;
      
      if (action.payload.isTestCompleted) {
        state.testStatus = 'completed';
        state.completionReason = action.payload.completionReason || null;
        state.currentQuestion = null;
      } else if (action.payload.nextQuestion) {
        state.currentQuestion = action.payload.nextQuestion;
      }
    },
    resetTest: (state) => {
      return initialState;
    },
  },
});

export const { setTestInfo, setCurrentQuestion, updateTestProgress, resetTest } = testSlice.actions;
export default testSlice.reducer;

