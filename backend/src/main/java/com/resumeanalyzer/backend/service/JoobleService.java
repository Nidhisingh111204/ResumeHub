package com.resumeanalyzer.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.backend.dto.JobResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class JoobleService {

    @Value("${jooble.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public JoobleService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<JobResponse> searchJobs(String query, String location) throws Exception {

        String url =
        "https://in.jooble.org/api/"
                + apiKey;

        String requestBody =
                "{"
                        + "\"keywords\":\"" + escapeJson(query) + "\","
                        + "\"location\":\"" + escapeJson(location) + "\","
                        + "\"page\":1,"
                        + "\"ResultOnPage\":20"
                        + "}";

        System.out.println("Calling Jooble...");

        String response =
                restTemplate.postForObject(
                        url,
                        new org.springframework.http.HttpEntity<>(
                                requestBody,
                                createHeaders()
                        ),
                        String.class
                );

        JsonNode root =
                objectMapper.readTree(response);

        JsonNode results =
                root.path("jobs");

        List<JobResponse> jobs =
                new ArrayList<>();

        for (JsonNode job : results) {

            String jobId =
                    job.path("id").asText();

            String title =
                    job.path("title")
                            .asText("Unknown title");

            String company =
                    job.path("company")
                            .asText("Company not specified");

            String jobLocation =
                    job.path("location")
                            .asText("Location not specified");

            String description =
                    job.path("snippet")
                            .asText("");

            String salary =
                    job.path("salary")
                            .asText("");

            String jobType =
                    job.path("type")
                            .asText("");

            String jobUrl =
                    job.path("link")
                            .asText("");

            String updated =
                    job.path("updated")
                            .asText("");

            Double salaryMin = null;
            Double salaryMax = null;

            jobs.add(
                    new JobResponse(
                            "jooble-" + jobId,
                            title,
                            company,
                            jobLocation,
                            "Not specified",
                            jobType.isBlank()
                                    ? "Not specified"
                                    : jobType,
                            description,
                            salaryMin,
                            salaryMax,
                            false,
                            updated,
                            jobUrl
                    )
            );
        }

        return jobs;
    }

    private org.springframework.http.HttpHeaders createHeaders() {

        org.springframework.http.HttpHeaders headers =
                new org.springframework.http.HttpHeaders();

        headers.setContentType(
                org.springframework.http.MediaType.APPLICATION_JSON
        );

        return headers;
    }

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}