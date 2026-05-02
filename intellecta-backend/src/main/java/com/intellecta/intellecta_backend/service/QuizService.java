package com.intellecta.intellecta_backend.service;

import com.intellecta.intellecta_backend.dto.request.QuizSubmissionRequest;
import com.intellecta.intellecta_backend.model.Question;
import com.intellecta.intellecta_backend.model.Quiz;
import com.intellecta.intellecta_backend.model.QuizAttempt;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.QuizAttemptRepository;
import com.intellecta.intellecta_backend.repository.QuizRepository;
import com.intellecta.intellecta_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {
     private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public List<Quiz> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        if (quizzes.size() < 3) {
            seedQuizzes();
            return quizRepository.findAll();
        }
        return quizzes;
    }

    public Quiz getQuizById(Long id) {
        return quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @org.springframework.transaction.annotation.Transactional
    public QuizAttempt submitQuiz(QuizSubmissionRequest request) {
        try {
            Quiz quiz = getQuizById(request.getQuizId());
            User user = userRepository.findById(request.getUserId()).orElseGet(() -> {
                System.out.println("Warning: User ID " + request.getUserId() + " not found. Falling back to the first available user.");
                return userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No users found in the database."));
            });

            int score = 0;
            List<Question> questions = quiz.getQuestions();
            Map<Long, Integer> userAnswers = request.getAnswers();

            System.out.println("Processing submission for quiz: " + quiz.getTitle() + " (Questions: " + (questions != null ? questions.size() : 0) + ")");

            if (userAnswers != null && questions != null) {
                for (Question q : questions) {
                    Integer userSelection = userAnswers.get(q.getId());
                    if (userSelection != null && userSelection.equals(q.getCorrectOptionIndex())) {
                        score++;
                    }
                }
            }

            QuizAttempt attempt = QuizAttempt.builder()
                    .user(user)
                    .quiz(quiz)
                    .score(score)
                    .totalQuestions(questions != null ? questions.size() : 0)
                    .userAnswers(userAnswers)
                    .startTime(LocalDateTime.now().minusMinutes(quiz.getTimeLimit()))
                    .endTime(LocalDateTime.now())
                    .status("COMPLETED")
                    .build();

            QuizAttempt saved = quizAttemptRepository.save(attempt);
            System.out.println("Quiz submitted successfully. Score: " + score + "/" + attempt.getTotalQuestions());
            return saved;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR IN QUIZ SUBMISSION: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void seedQuizzes() {
        // 1. Molecular Biology
        if (quizRepository.findAll().stream().noneMatch(q -> q.getTitle().equals("Molecular Biology"))) {
            Quiz q1 = Quiz.builder()
                    .title("Molecular Biology")
                    .description("Cellular structures, DNA replication, and protein synthesis.")
                    .timeLimit(20)
                    .category("Biology")
                    .difficulty("Intermediate")
                    .imageUrl("https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800")
                    .build();
            Quiz savedQ1 = quizRepository.save(q1);
            savedQ1.setQuestions(List.of(
                Question.builder().text("What is the primary function of DNA?").options(List.of("Energy storage", "Genetic information", "Protein digestion", "Cell movement")).correctOptionIndex(1).quiz(savedQ1).build(),
                Question.builder().text("Which organelle is known as the powerhouse of the cell?").options(List.of("Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus")).correctOptionIndex(2).quiz(savedQ1).build(),
                Question.builder().text("What process converts DNA to RNA?").options(List.of("Translation", "Transcription", "Replication", "Mutation")).correctOptionIndex(1).quiz(savedQ1).build()
            ));
            quizRepository.save(savedQ1);
        }

        // 2. Quantum Mechanics
        if (quizRepository.findAll().stream().noneMatch(q -> q.getTitle().equals("Quantum Mechanics & Wave Functions"))) {
            Quiz q2 = Quiz.builder()
                    .title("Quantum Mechanics & Wave Functions")
                    .description("Push your limits with our weekly intensive quiz covering the observer effect.")
                    .timeLimit(15)
                    .category("Physics")
                    .difficulty("Expert")
                    .imageUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800")
                    .build();
            Quiz savedQ2 = quizRepository.save(q2);
            savedQ2.setQuestions(List.of(
                Question.builder().text("Who proposed the uncertainty principle?").options(List.of("Einstein", "Bohr", "Heisenberg", "Schrödinger")).correctOptionIndex(2).quiz(savedQ2).build(),
                Question.builder().text("What does the square of the wave function represent?").options(List.of("Energy", "Momentum", "Probability density", "Velocity")).correctOptionIndex(2).quiz(savedQ2).build()
            ));
            quizRepository.save(savedQ2);
        }

        // 3. Neuropharmacology
        if (quizRepository.findAll().stream().noneMatch(q -> q.getTitle().equals("Neuropharmacology Principles"))) {
            Quiz q3 = Quiz.builder()
                    .title("Neuropharmacology Principles")
                    .description("Assessment on synaptic transmission and neurotransmitter pathways.")
                    .timeLimit(60)
                    .category("Biology")
                    .difficulty("Expert")
                    .imageUrl("https://images.pexels.com/photos/8533087/pexels-photo-8533087.jpeg")
                    .build();
            Quiz savedQ3 = quizRepository.save(q3);
            savedQ3.setQuestions(List.of(
                Question.builder().text("Which neurotransmitter is primary at the neuromuscular junction?").options(List.of("Dopamine", "Serotonin", "Acetylcholine", "GABA")).correctOptionIndex(2).quiz(savedQ3).build()
            ));
            quizRepository.save(savedQ3);
        }
    }
}
