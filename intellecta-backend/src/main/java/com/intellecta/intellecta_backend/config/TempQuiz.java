//FOR TESTING ONLY, TO BE DELETED ONCE DECIDED HOW QUIZES ARE INITIALIZED.

package com.intellecta.intellecta_backend.config;

import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class TempQuiz implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User defaultUser = new User();
            defaultUser.setUsername("Hasan Butt");
            defaultUser.setEmail("hasan@intellecta.com");
            defaultUser.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(defaultUser);
            System.out.println("Default user seeded: hasan@intellecta.com / password123");
        }
        System.out.println("Total users in DB: " + userRepository.count());

    }
}