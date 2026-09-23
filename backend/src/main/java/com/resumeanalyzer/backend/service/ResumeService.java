package com.resumeanalyzer.backend.service;

import com.resumeanalyzer.backend.model.Resume;
import com.resumeanalyzer.backend.repository.ResumeRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final PdfParserService pdfParserService;

    public ResumeService(
            ResumeRepository resumeRepository,
            PdfParserService pdfParserService
    ) {
        this.resumeRepository = resumeRepository;
        this.pdfParserService = pdfParserService;
    }

    public Resume uploadResume(MultipartFile file) throws Exception {

        String extractedText =
                pdfParserService.extractText(file);

        Resume resume = new Resume();

        resume.setFileName(
                file.getOriginalFilename()
        );

        resume.setExtractedText(
                extractedText
        );

        return resumeRepository.save(resume);
    }
}