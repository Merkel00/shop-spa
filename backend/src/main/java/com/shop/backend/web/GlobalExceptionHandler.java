package com.shop.backend.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ApiError handleResponseStatus(
      ResponseStatusException ex,
      HttpServletRequest req
  ) {
    HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

    return new ApiError(
        Instant.now(),
        status.value(),
        status.getReasonPhrase(),
        ex.getReason(),
        req.getRequestURI()
    );
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiError handleValidation(
      MethodArgumentNotValidException ex,
      HttpServletRequest req
  ) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .findFirst()
        .map(err -> err.getDefaultMessage() == null ? "Validation failed" : err.getDefaultMessage())
        .orElse("Validation failed");

    return new ApiError(
        Instant.now(),
        400,
        "Bad Request",
        message,
        req.getRequestURI()
    );
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ApiError handleUnknown(
      Exception ex,
      HttpServletRequest req
  ) {
    return new ApiError(
        Instant.now(),
        500,
        "Internal Server Error",
        "Unexpected error",
        req.getRequestURI()
    );
  }
}