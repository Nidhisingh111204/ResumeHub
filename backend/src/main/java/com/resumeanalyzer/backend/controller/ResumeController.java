package com.resumeanalyzer.backend.controller;

import com.resumeanalyzer.backend.model.Resume;
import com.resumeanalyzer.backend.service.ResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file
    ) {
        try {

            Resume resume =
                    resumeService.uploadResume(file);

            return ResponseEntity.ok(resume);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Resume upload failed: "
                                    + e.getMessage()
                    );
        }
    }
}