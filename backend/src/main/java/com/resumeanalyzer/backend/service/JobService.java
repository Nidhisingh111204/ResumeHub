package com.resumeanalyzer.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.backend.dto.JobResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class JobService {

    @Value("${adzuna.app.id}")
    private String appId;

    @Value("${adzuna.app.key}")
    private String appKey;

    @Value("${adzuna.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public JobService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<JobResponse> searchJobs(String query, String location) throws Exception {

        String encodedQuery =
                URLEncoder.encode(query, StandardCharsets.UTF_8);

        String encodedLocation =
                URLEncoder.encode(location, StandardCharsets.UTF_8);

        String url =
                apiUrl
                        + "/jobs/in/search/1"
                        + "?app_id="
                        + URLEncoder.encode(appId, StandardCharsets.UTF_8)
                        + "&app_key="
                        + URLEncoder.encode(appKey, StandardCharsets.UTF_8)
                        + "&results_per_page=10"
                        + "&what=" + encodedQuery
                        + "&where=" + encodedLocation
                        + "&content-type=application/json";

        System.out.println("Calling Adzuna:");
        System.out.println(url.replace(appKey, "HIDDEN"));

        String response =
                restTemplate.getForObject(url, String.class);

        JsonNode root =
                objectMapper.readTree(response);

        JsonNode results =
                root.path("results");

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
                            .path("display_name")
                            .asText("Company not specified");

            String jobLocation =
                    job.path("location")
                            .path("display_name")
                            .asText("Location not specified");

            String description =
                    job.path("description")
                            .asText("");

            String contractTime =
                    job.path("contract_time")
                            .asText("");

            String contractType =
                    job.path("contract_type")
                            .asText("");

            String jobUrl =
                    job.path("redirect_url")
                            .asText("");

            String created =
                    job.path("created")
                            .asText("");

            Double salaryMin = null;

            if (!job.path("salary_min").isMissingNode()
                    && !job.path("salary_min").isNull()) {

                salaryMin =
                        job.path("salary_min").asDouble();
            }

            Double salaryMax = null;

            if (!job.path("salary_max").isMissingNode()
                    && !job.path("salary_max").isNull()) {

                salaryMax =
                        job.path("salary_max").asDouble();
            }

            boolean salaryPredicted =
                    job.path("salary_is_predicted")
                            .asInt(0) == 1;

            String employmentType =
                    "Not specified";

            if (!contractTime.isBlank()
                    && !contractType.isBlank()) {

                employmentType =
                        formatValue(contractTime)
                                + " / "
                                + formatValue(contractType);

            } else if (!contractTime.isBlank()) {

                employmentType =
                        formatValue(contractTime);

            } else if (!contractType.isBlank()) {

                employmentType =
                        formatValue(contractType);
            }

            jobs.add(
                    new JobResponse(
                            jobId,
                            title,
                            company,
                            jobLocation,
                            "Not specified",
                            employmentType,
                            description,
                            salaryMin,
                            salaryMax,
                            salaryPredicted,
                            created,
                            jobUrl
                    )
            );
        }

        return jobs;
    }

    private String formatValue(String value) {

        if (value == null || value.isBlank()) {
            return "Not specified";
        }

        return value
                .replace("_", " ")
                .replace("-", " ");
    }
}