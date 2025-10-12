package com.example.backend.controller;

import com.example.backend.model.Enrollment;
import com.example.backend.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public List<Enrollment> list() {
        return enrollmentService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> get(@PathVariable Long id) {
        return enrollmentService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestBody Map<String, Object> payload) {
        Long studentId = ((Number) payload.get("studentId")).longValue();
        Long courseId = ((Number) payload.get("courseId")).longValue();
        String term = (String) payload.get("term");
        return enrollmentService.enroll(studentId, courseId, term)
                .map(saved -> ResponseEntity.created(URI.create("/api/enrollments/" + saved.getId())).body(saved))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PatchMapping("/{id}/grade")
    public ResponseEntity<Enrollment> setGrade(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return enrollmentService.setGrade(id, payload.get("grade"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
