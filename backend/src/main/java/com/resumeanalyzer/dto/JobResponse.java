package com.resumeanalyzer.dto;

public class JobResponse {

    private String jobId;
    private String title;
    private String company;
    private String location;
    private String workModel;
    private String employmentType;
    private String description;
    private Double salaryMin;
    private Double salaryMax;
    private boolean salaryPredicted;
    private String created;
    private String url;

    public JobResponse(
            String jobId,
            String title,
            String company,
            String location,
            String workModel,
            String employmentType,
            String description,
            Double salaryMin,
            Double salaryMax,
            boolean salaryPredicted,
            String created,
            String url) {

        this.jobId = jobId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.workModel = workModel;
        this.employmentType = employmentType;
        this.description = description;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.salaryPredicted = salaryPredicted;
        this.created = created;
        this.url = url;
    }

    public String getJobId() {
        return jobId;
    }

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public String getLocation() {
        return location;
    }

    public String getWorkModel() {
        return workModel;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public String getDescription() {
        return description;
    }

    public Double getSalaryMin() {
        return salaryMin;
    }

    public Double getSalaryMax() {
        return salaryMax;
    }

    public boolean isSalaryPredicted() {
        return salaryPredicted;
    }

    public String getCreated() {
        return created;
    }

    public String getUrl() {
        return url;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setWorkModel(String workModel) {
        this.workModel = workModel;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSalaryMin(Double salaryMin) {
        this.salaryMin = salaryMin;
    }

    public void setSalaryMax(Double salaryMax) {
        this.salaryMax = salaryMax;
    }

    public void setSalaryPredicted(boolean salaryPredicted) {
        this.salaryPredicted = salaryPredicted;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}