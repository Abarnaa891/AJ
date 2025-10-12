package com.example.backend.service;

import com.example.backend.model.Course;
import com.example.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Optional<Course> getById(Long id) {
        return courseRepository.findById(id);
    }

    public Course create(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> update(Long id, Course updated) {
        return courseRepository.findById(id).map(existing -> {
            existing.setCode(updated.getCode());
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setCredits(updated.getCredits());
            return courseRepository.save(existing);
        });
    }

    public void delete(Long id) {
        courseRepository.deleteById(id);
    }
}
