package com.resumeanalyzer.backend.controller;

import com.resumeanalyzer.backend.dto.JobResponse;
import com.resumeanalyzer.backend.service.JobService;
import com.resumeanalyzer.backend.service.JoobleService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobService jobService;
    private final JoobleService joobleService;

    public JobController(
            JobService jobService,
            JoobleService joobleService
    ) {
        this.jobService = jobService;
        this.joobleService = joobleService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestParam String query,
            @RequestParam(defaultValue = "India") String location
    ) {

        System.out.println("=================================");
        System.out.println("JOB SEARCH REQUEST");
        System.out.println("Query: " + query);
        System.out.println("Location: " + location);
        System.out.println("=================================");

        List<JobResponse> allJobs = new ArrayList<>();

        // -------------------------
        // ADZUNA
        // -------------------------
        try {

            List<JobResponse> adzunaJobs =
                    jobService.searchJobs(query, location);

            System.out.println(
                    "Jobs received from Adzuna: "
                            + adzunaJobs.size()
            );

            allJobs.addAll(adzunaJobs);

        } catch (Exception e) {

            System.out.println("ADZUNA ERROR:");
            e.printStackTrace();
        }

        // -------------------------
        // JOOBLE
        // -------------------------
        try {

            List<JobResponse> joobleJobs =
                    joobleService.searchJobs(query, location);

            System.out.println(
                    "Jobs received from Jooble: "
                            + joobleJobs.size()
            );

            allJobs.addAll(joobleJobs);

        } catch (Exception e) {

            System.out.println("JOOBLE ERROR:");
            e.printStackTrace();
        }

        System.out.println("---------------------------------");
        System.out.println(
                "TOTAL JOBS: " + allJobs.size()
        );
        System.out.println("---------------------------------");

        return ResponseEntity.ok(allJobs);
    }
}