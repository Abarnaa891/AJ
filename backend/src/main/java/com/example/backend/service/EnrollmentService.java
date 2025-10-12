package com.example.backend.service;

import com.example.backend.model.Course;
import com.example.backend.model.Enrollment;
import com.example.backend.model.Student;
import com.example.backend.repository.CourseRepository;
import com.example.backend.repository.EnrollmentRepository;
import com.example.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             StudentRepository studentRepository,
                             CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public List<Enrollment> getAll() {
        return enrollmentRepository.findAll();
    }

    public Optional<Enrollment> getById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public Optional<Enrollment> enroll(Long studentId, Long courseId, String term) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (studentOpt.isEmpty() || courseOpt.isEmpty()) {
            return Optional.empty();
        }
        Enrollment enrollment = new Enrollment(studentOpt.get(), courseOpt.get(), term);
        return Optional.of(enrollmentRepository.save(enrollment));
    }

    public Optional<Enrollment> setGrade(Long id, String grade) {
        return enrollmentRepository.findById(id).map(e -> {
            e.setGrade(grade);
            return enrollmentRepository.save(e);
        });
    }

    public void delete(Long id) {
        enrollmentRepository.deleteById(id);
    }
}
