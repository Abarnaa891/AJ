package com.example.backend.config;

import com.example.backend.model.Course;
import com.example.backend.model.Student;
import com.example.backend.repository.CourseRepository;
import com.example.backend.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner seedData(StudentRepository studentRepository, CourseRepository courseRepository) {
        return args -> {
            if (studentRepository.count() == 0) {
                studentRepository.save(new Student("Alice", "Anderson", "alice@example.com"));
                studentRepository.save(new Student("Bob", "Brown", "bob@example.com"));
                studentRepository.save(new Student("Charlie", "Clark", "charlie@example.com"));
            }
            if (courseRepository.count() == 0) {
                courseRepository.save(new Course("CS101", "Intro to CS", "Basics of programming and computer science.", 3));
                courseRepository.save(new Course("MATH201", "Calculus II", "Integral calculus and series.", 4));
                courseRepository.save(new Course("HIST150", "World History", "Survey of global history.", 3));
            }
        };
    }
}
