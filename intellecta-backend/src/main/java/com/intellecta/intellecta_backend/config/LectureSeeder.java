package com.intellecta.intellecta_backend.config;

import com.intellecta.intellecta_backend.dto.ResourceLinkDto;
import com.intellecta.intellecta_backend.enums.UserRoles;
import com.intellecta.intellecta_backend.model.User;
import com.intellecta.intellecta_backend.model.VideoLecture;
import com.intellecta.intellecta_backend.repository.UserRepository;
import com.intellecta.intellecta_backend.repository.VideoLectureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LectureSeeder implements CommandLineRunner {

    private final VideoLectureRepository lectureRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the video lectures table is empty
        if (lectureRepository.count() == 0) {
            
            // Find an admin user to own the seeded lectures
            User admin = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == UserRoles.ADMIN)
                    .findFirst()
                    .orElse(null);

            if (admin == null) {
                System.out.println("[LectureSeeder] No admin user found. Skipping lecture seeding.");
                return;
            }

            VideoLecture l1 = VideoLecture.builder()
                    .admin(admin)
                    .title("Life as SWE.")
                    .description("This vlog follows Gazi, a software engineer at Google in NYC, as she balances her tech career, side projects, and personal growth.\n\nVideo Highlights:\n\nWork & Tech Life (0:00 - 4:05): Gazi navigates a busy workday with meetings and an office tour, while managing her daily routine and dealing with the pressures of New York Tech Week.\nCreative Projects (7:12 - 9:53): She shares her passion for building web tools, specifically a virtual guest book project created using the Lovable platform.\nScience Camp (9:53 - 13:45): Gazi attends a science retreat where she engages in experiments like making cyanotypes, exploring local nature, and discussing profound scientific concepts like the Heisenberg uncertainty principle.\nPersonal Reflection: Throughout the video, she reflects on the importance of maintaining childlike curiosity and finding joy in learning beyond the status quo of a corporate career.")
                    .youtubeUrl("https://youtu.be/y3IEfRuUuVg?si=mEaY79Ex6GBCoVJm")
                    .youtubeVideoId("y3IEfRuUuVg")
                    .topic("Testing 1")
                    .orderIndex(1)
                    .published(true)
                    .resourceLinks(Arrays.asList(
                            new ResourceLinkDto("Testing Resource", "https://www.gazijarin.com/"),
                            new ResourceLinkDto("Testing Resource 2", "https://www.linkedin.com/in/gazijarin/")
                    ))
                    .build();

            VideoLecture l2 = VideoLecture.builder()
                    .admin(admin)
                    .title("Developer are back!")
                    .description("This video examines why the widespread assumption that AI would replace human software engineers has failed, leading to a recent surge in tech companies rehiring developers.\n\nKey Takeaways:\n\nThe Rise and Fall of the AI Narrative: From 2021 to 2025, tools like GitHub Copilot, ChatGPT, and Devon fueled fears that developers were obsolete (1:29-6:55). However, by 2026, companies realized that relying solely on AI was a mistake, leading to a rise in \"boomerang hiring,\" where firms actively seek out previously fired engineers who understand their systems (7:38-10:26).\nThe Two Fatal Flaws of AI Coding:\nHidden Bugs: AI-generated code contains 1.7 times more errors than human-written code, often resulting in subtle issues that compromise product stability (8:15-9:27).\nBloated Code: AI often adds unnecessary complexity, resulting in 38% more code volume that becomes difficult to maintain (9:27-10:26).\nAdapting for the Future: To stay competitive in this market, the video suggests three primary skills:\nBecome a Forward-Deployed Engineer: Focus on solving real-world customer problems rather than just writing code (11:24-12:25).\nBuild Career Insurance: Prioritize building a strong professional network and relationships, as many rehiring efforts happen through referrals rather than public job postings (12:25-13:38).\nLearn to Orchestrate AI: Master the ability to supervise and coordinate AI tools, effectively acting as a conductor for the code they produce (13:38-14:32).")
                    .youtubeUrl("https://youtu.be/Zdus-d4ehN0?si=V7k-S5G1VwBlbPlb")
                    .youtubeVideoId("Zdus-d4ehN0")
                    .topic("Test")
                    .orderIndex(2)
                    .published(true)
                    .build();

            VideoLecture l3 = VideoLecture.builder()
                    .admin(admin)
                    .title("Making the worst game possible!")
                    .description("In this video, creator Juniper Dev participates in a 24-hour \"anti-hackathon\" at their university, where the goal is to build the most intentionally useless and bad project possible (0:00). Along with teammates Nathan and Nefelli, Juniper decides to develop an intentionally overwhelming pop-up simulation game inspired by the chaotic nature of early desktop operating systems (2:45).\n\nKey highlights of the development process:\n\nDesign Concept: The team opts to recreate the aesthetic of Windows 95, utilizing its iconic pixelated UI and \"clicky\" buttons to create a sense of familiarity (5:05).\nTechnical Implementation: They use the Godot engine, implementing a nine-slicing technique to create scalable, non-blurry windows (5:48) and face various challenges with GitHub version control (8:21).\nGameplay Loop: The game forces the user to manage a constant barrage of tasks, such as clearing captchas, responding to fake social media threads, and dealing with mock viruses, with the goal of scoring points before the virtual battery dies (4:34).\nThe Final Showcase: After 12 hours of development, the team—calling themselves the Shitty Kitties—presents their project, Windows 95.exe, to the hackathon judges (11:43). A volunteer judge, Zach, is tasked with playing the game live, leading to a humorous demonstration of the intentionally frustrating and \"authentic\" user experience (12:15).\nWhile the project does not win any of the specific categories during the award ceremony, the team succeeds in creating a functional, nostalgic, and intentionally chaotic game that viewers can play for free online (13:10).")
                    .youtubeUrl("https://youtu.be/PPWlcAH8-KY?si=DK2WJBPC6_NSRDRs")
                    .youtubeVideoId("PPWlcAH8-KY")
                    .topic("Test 3")
                    .orderIndex(3)
                    .published(true)
                    .build();

            lectureRepository.saveAll(Arrays.asList(l1, l2, l3));
            System.out.println("[LectureSeeder] Seeded 3 default video lectures successfully.");
        }
    }
}
