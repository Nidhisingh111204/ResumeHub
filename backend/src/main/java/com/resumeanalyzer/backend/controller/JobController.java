package com.resumeanalyzer.backend.controller;

import com.resumeanalyzer.backend.dto.JobResponse;
import com.resumeanalyzer.backend.service.JobService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestParam String query,
            @RequestParam(defaultValue = "India") String location
    ) {

        try {

            System.out.println("=================================");
            System.out.println("JOB SEARCH REQUEST");
            System.out.println("Query: " + query);
            System.out.println("Location: " + location);
            System.out.println("=================================");

            List<JobResponse> jobs =
                    jobService.searchJobs(query, location);

            System.out.println(
                    "Jobs received from Adzuna: "
                            + jobs.size()
            );

            return ResponseEntity.ok(jobs);

        } catch (Exception e) {

            System.out.println("=================================");
            System.out.println("ADZUNA JOB SEARCH ERROR");
            System.out.println("=================================");

            e.printStackTrace();

            String errorMessage = e.getMessage();

            if (errorMessage == null || errorMessage.isBlank()) {
                errorMessage = e.toString();
            }

            return ResponseEntity
                    .badRequest()
                    .body("Adzuna API Error: " + errorMessage);
        }
    }
}